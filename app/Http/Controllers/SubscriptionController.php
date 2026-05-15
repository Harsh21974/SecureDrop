<?php
// app/Http/Controllers/SubscriptionController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PaymentMethod;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\PaymentMethod as StripePaymentMethod;
use Stripe\Subscription;
use Stripe\Invoice as StripeInvoice;
use Stripe\Checkout\Session;

class SubscriptionController extends Controller
{
    private $plans;
    
    public function __construct()
    {
        // Set Stripe API key
        $stripeSecretKey = env('STRIPE_SECRET_KEY');
        if ($stripeSecretKey) {
            Stripe::setApiKey($stripeSecretKey);
        }
        
        // Initialize plans - only yearly
        $this->plans = [
            'yearly' => [
                'price_id' => env('STRIPE_YEARLY_PRICE_ID'),
                'name' => 'Yearly Plan',
                'price' => 9.99,
                'interval' => 'year',
            ],
        ];
    }
    
    /**
     * Get available plans
     */
    public function plans()
    {
        return response()->json($this->plans);
    }
    
    /**
     * Get current subscription status
     */
    public function status()
    {
        $user = Auth::user();
        
        return response()->json([
            'is_premium' => $user->isPremium(),
            'has_active_subscription' => $user->hasActiveSubscription(),
            'subscription_status' => $user->subscription_status,
            'subscription_ends_at' => $user->subscription_ends_at,
            'plan_type' => $user->plan_type,
            'ends_in_days' => $user->subscriptionEndsInDays(),
        ]);
    }
    
    /**
     * Create Stripe Checkout session for subscription
     */
    public function createCheckoutSession(Request $request)
    {
        // Fixed validation - removed the incorrect line
        $request->validate([
            'plan' => 'required|in:yearly',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url',
        ]);
        
        $user = Auth::user();
        $plan = $this->plans[$request->plan];
        
        // Check if price ID is configured
        if (!$plan['price_id']) {
            return response()->json([
                'message' => 'Price ID not configured. Please contact administrator.'
            ], 500);
        }
        
        // Get or create Stripe customer
        $customer = $this->getOrCreateCustomer($user);
        
        $checkoutSession = Session::create([
            'customer' => $customer->id,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $plan['price_id'],
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => $request->success_url . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $request->cancel_url,
            'metadata' => [
                'user_id' => $user->id,
                'plan' => $request->plan,
            ],
        ]);
        
        return response()->json([
            'session_id' => $checkoutSession->id,
            'url' => $checkoutSession->url,
        ]);
    }
    
    /**
     * Verify and activate subscription after successful checkout
     */
    /**
 * Verify and activate subscription after successful checkout
 */
    public function verifyAndActivate(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);
        
        $user = Auth::user();
        
        try {
            $session = Session::retrieve($request->session_id);
            
            if ($session->metadata->user_id != $user->id) {
                return response()->json(['message' => 'Invalid session'], 403);
            }
            
            if ($session->payment_status !== 'paid') {
                return response()->json(['message' => 'Payment not completed'], 400);
            }
            
            $subscription = Subscription::retrieve($session->subscription);
            
            // ✅ FIX: Get the correct end date from the subscription item
            $endsAt = null;
            if ($subscription->items && $subscription->items->data && count($subscription->items->data) > 0) {
                $currentPeriodEnd = $subscription->items->data[0]->current_period_end;
                $endsAt = date('Y-m-d H:i:s', $currentPeriodEnd);
            } else {
                // Fallback: 1 year from now
                $endsAt = now()->addYear();
            }
            
            $user->update([
                'stripe_subscription_id' => $subscription->id,
                'subscription_status' => $subscription->status,
                'subscription_ends_at' => $endsAt,
                'plan_type' => 'yearly',
                'is_premium' => true,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Subscription activated successfully!',
                'ends_at' => $endsAt,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Subscription verification failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to verify subscription: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Handle Stripe webhook
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $webhook_secret = env('STRIPE_WEBHOOK_SECRET');
        
        if (!$webhook_secret) {
            return response()->json(['error' => 'Webhook secret not configured'], 400);
        }
        
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $webhook_secret
            );
        } catch (\Exception $e) {
            return response()->json(['error' => 'Webhook signature verification failed'], 400);
        }
        
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;
            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event->data->object);
                break;
            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event->data->object);
                break;
        }
        
        return response()->json(['status' => 'success']);
    }
    
    /**
     * Cancel subscription
     */
    public function cancelSubscription(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->stripe_subscription_id) {
            return response()->json(['message' => 'No active subscription'], 400);
        }
        
        try {
            $subscription = Subscription::retrieve($user->stripe_subscription_id);
            $subscription->cancel();
            
            $user->update([
                'subscription_status' => 'cancelled',
                'subscription_ends_at' => now()->addSeconds($subscription->current_period_end - time()),
            ]);
            
            if (!$user->is_premium) {
                $user->update(['is_premium' => false]);
            }
            
            return response()->json(['message' => 'Subscription cancelled successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to cancel subscription: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Get customer payment methods
     */
    public function getPaymentMethods()
    {
        $user = Auth::user();
        
        if (!$user->stripe_customer_id) {
            return response()->json([]);
        }
        
        $paymentMethods = PaymentMethod::where('user_id', $user->id)->get();
        
        return response()->json($paymentMethods);
    }
    
    /**
     * Set default payment method
     */
    public function setDefaultPaymentMethod(Request $request, $paymentMethodId)
    {
        $user = Auth::user();
        
        $paymentMethod = PaymentMethod::where('user_id', $user->id)
            ->where('id', $paymentMethodId)
            ->firstOrFail();
        
        $customer = Customer::retrieve($user->stripe_customer_id);
        $customer->invoice_settings = ['default_payment_method' => $paymentMethod->stripe_payment_method_id];
        $customer->save();
        
        PaymentMethod::where('user_id', $user->id)->update(['is_default' => false]);
        $paymentMethod->update(['is_default' => true]);
        
        return response()->json(['message' => 'Default payment method updated']);
    }
    
    /**
     * Get invoice history
     */
    public function getInvoices()
    {
        $user = Auth::user();
        
        $invoices = Invoice::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($invoices);
    }
    
    /**
     * Create a portal session for customer to manage billing
     */
    public function createPortalSession(Request $request)
    {
        $request->validate([
            'return_url' => 'required|url',
        ]);
        
        $user = Auth::user();
        
        if (!$user->stripe_customer_id) {
            return response()->json(['message' => 'No customer found'], 400);
        }
        
        $session = \Stripe\BillingPortal\Session::create([
            'customer' => $user->stripe_customer_id,
            'return_url' => $request->return_url,
        ]);
        
        return response()->json(['url' => $session->url]);
    }
    
    // Private helper methods
    
    private function getOrCreateCustomer($user)
    {
        if ($user->stripe_customer_id) {
            try {
                return Customer::retrieve($user->stripe_customer_id);
            } catch (\Exception $e) {
                // Customer doesn't exist or error, create new one
            }
        }
        
        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);
        
        $user->update(['stripe_customer_id' => $customer->id]);
        
        return $customer;
    }
    
    private function handleCheckoutSessionCompleted($session)
    {
        $userId = $session->metadata->user_id ?? null;
        if (!$userId) return;
        
        $user = User::find($userId);
        if (!$user) return;
        
        $subscription = Subscription::retrieve($session->subscription);
        
        // ✅ FIX: Get the correct end date from the subscription item
        $endsAt = null;
        if ($subscription->items && $subscription->items->data && count($subscription->items->data) > 0) {
            $currentPeriodEnd = $subscription->items->data[0]->current_period_end;
            $endsAt = date('Y-m-d H:i:s', $currentPeriodEnd);
        } else {
            $endsAt = now()->addYear();
        }
        
        $user->update([
            'stripe_subscription_id' => $subscription->id,
            'subscription_status' => $subscription->status,
            'subscription_ends_at' => $endsAt,
            'plan_type' => $session->metadata->plan,
            'is_premium' => true,
        ]);
        
        if ($session->payment_method) {
            $this->savePaymentMethod($user, $session->payment_method);
        }
    }
    
    private function handleSubscriptionUpdated($subscription)
    {
        $user = User::where('stripe_subscription_id', $subscription->id)->first();
        if (!$user) return;
        
        $user->update([
            'subscription_status' => $subscription->status,
            'subscription_ends_at' => $subscription->cancel_at_period_end ? 
                now()->addSeconds($subscription->current_period_end - time()) : null,
        ]);
        
        if ($subscription->status === 'active') {
            $user->update(['is_premium' => true]);
        }
    }
    
    private function handleSubscriptionDeleted($subscription)
    {
        $user = User::where('stripe_subscription_id', $subscription->id)->first();
        if (!$user) return;
        
        $user->update([
            'stripe_subscription_id' => null,
            'subscription_status' => 'inactive',
            'subscription_ends_at' => null,
            'plan_type' => null,
        ]);
        
        if (!$user->is_premium) {
            $user->update(['is_premium' => false]);
        }
    }
    
    private function handleInvoicePaymentSucceeded($invoice)
    {
        $user = User::where('stripe_customer_id', $invoice->customer)->first();
        if (!$user) return;
        
        Invoice::updateOrCreate(
            ['stripe_invoice_id' => $invoice->id],
            [
                'user_id' => $user->id,
                'stripe_payment_intent_id' => $invoice->payment_intent,
                'amount' => $invoice->amount_paid / 100,
                'currency' => $invoice->currency,
                'status' => 'paid',
                'invoice_pdf' => $invoice->invoice_pdf,
                'paid_at' => now(),
            ]
        );
    }
    
    private function handleInvoicePaymentFailed($invoice)
    {
        $user = User::where('stripe_customer_id', $invoice->customer)->first();
        if (!$user) return;
        
        Invoice::updateOrCreate(
            ['stripe_invoice_id' => $invoice->id],
            [
                'user_id' => $user->id,
                'amount' => $invoice->amount_due / 100,
                'currency' => $invoice->currency,
                'status' => 'unpaid',
            ]
        );
        
        if ($user->stripe_subscription_id) {
            $user->update(['subscription_status' => 'past_due']);
        }
    }
    
    private function savePaymentMethod($user, $paymentMethodId)
    {
        try {
            $stripePaymentMethod = StripePaymentMethod::retrieve($paymentMethodId);
            
            PaymentMethod::updateOrCreate(
                ['stripe_payment_method_id' => $paymentMethodId],
                [
                    'user_id' => $user->id,
                    'card_brand' => $stripePaymentMethod->card->brand ?? null,
                    'card_last4' => $stripePaymentMethod->card->last4 ?? null,
                    'exp_month' => $stripePaymentMethod->card->exp_month ?? null,
                    'exp_year' => $stripePaymentMethod->card->exp_year ?? null,
                    'is_default' => !PaymentMethod::where('user_id', $user->id)->exists(),
                ]
            );
        } catch (\Exception $e) {
            // Log error but don't fail
            \Log::error('Failed to save payment method: ' . $e->getMessage());
        }
    }
}