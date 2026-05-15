// resources/js/pages/Subscription.jsx
import React, { useState } from 'react';
import { useSubscription } from '../../src/contexts/SubscriptionContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { CheckCircle, Star, CreditCard, FileText, XCircle, RefreshCw } from 'lucide-react';

export default function Subscription() {
    const { user } = useAuth();
    const { 
        plans, 
        subscriptionStatus, 
        subscribe, 
        cancelSubscription, 
        manageBilling,
        fetchSubscriptionStatus,
        loading,
        isPremium,
        hasActiveSubscription
    } = useSubscription();
    
    const [processingPlan, setProcessingPlan] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const features = [
        'Unlimited secure messages',
        'File attachments up to 100MB',
        'Workspace collaboration',
        'Multi-recipient encryption',
        'Priority support',
        'Advanced analytics',
    ];

    const handleSubscribe = async (plan) => {
        setProcessingPlan(plan);
        try {
            const successUrl = `${window.location.origin}/subscription/success`;
            const cancelUrl = `${window.location.origin}/pricing`;
            await subscribe(plan, successUrl, cancelUrl);
        } catch (err) {
            alert('Failed to start subscription: ' + err.message);
        } finally {
            setProcessingPlan(null);
        }
    };

    const handleCancelSubscription = async () => {
        setCancelling(true);
        try {
            await cancelSubscription();
            setShowCancelConfirm(false);
            await fetchSubscriptionStatus();
            alert('Your subscription has been cancelled. You will continue to have access until the end of your billing period.');
        } catch (err) {
            alert('Failed to cancel subscription: ' + err.message);
        } finally {
            setCancelling(false);
        }
    };

    const handleManageBilling = async () => {
        try {
            await manageBilling(window.location.href);
        } catch (err) {
            alert('Failed to open billing portal: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="animate-spin text-teal-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                        <Star size={16} className="text-teal-600" />
                        <span className="text-sm font-medium text-teal-700">Simple, Transparent Pricing</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Upgrade to premium for unlimited secure messaging and advanced features
                    </p>
                </div>

                {/* Current Subscription Status */} 
                {isPremium && (
                    <div className="mb-8 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                    <CheckCircle size={24} className="text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Premium Active</h3>
                                    <p className="text-sm text-gray-600">
                                        {hasActiveSubscription && subscriptionStatus?.subscription_ends_at ? (
                                            <>Active until {new Date(subscriptionStatus.subscription_ends_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</>
                                        ) : (
                                            <>Lifetime premium access</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleManageBilling}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Manage Billing
                                </button>
                                {hasActiveSubscription && (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Subscription?</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to cancel your subscription? You will continue to have premium access until your current billing period ends.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                                >
                                    Keep Premium
                                </button>
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                                >
                                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Plans */}
                {!isPremium && plans.length > 0 && (
                <div className="max-w-md mx-auto">
                    {plans.map((plan, index) => (
                        <div key={plan.price_id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-teal-400 relative hover:shadow-2xl transition-all">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                    <span className="text-gray-500">/year</span>
                                </div>
                                
                                <ul className="space-y-3 mb-8">
                                    {features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle size={16} className="text-teal-500 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                <button
                                    onClick={() => handleSubscribe(plan.interval)}
                                    disabled={processingPlan === plan.interval}
                                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                                >
                                    {processingPlan === plan.interval ? 'Processing...' : 'Subscribe →'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

                {/* Payment Methods Section (for premium users) */}
                {isPremium && (
                    <div className="mt-12 grid md:grid-cols-2 gap-8">
                        {/* Payment Methods */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard size={20} className="text-teal-600" />
                                <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                            </div>
                            <button
                                onClick={handleManageBilling}
                                className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                            >
                                Manage Payment Methods
                            </button>
                        </div>
                        
                        {/* Invoice History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-teal-600" />
                                <h3 className="font-semibold text-gray-900">Invoice History</h3>
                            </div>
                            <button
                                onClick={handleManageBilling}
                                className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                            >
                                View Invoices
                            </button>
                        </div>
                    </div>
                )}

                {/* Features Comparison */}
                <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Feature Comparison</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {[
                            { feature: 'Secure messages', free: '5/month', premium: 'Unlimited' },
                            { feature: 'File size limit', free: '20MB', premium: '50MB' },
                            { feature: 'Workspace members', free: '3', premium: 'Unlimited' },
                            { feature: 'Recipients per message', free: '1', premium: 'Unlimited' },
                            { feature: 'Message expiry', free: 'Up to 7 days', premium: 'Up to 30 days' },
                            { feature: 'Support', free: 'Community', premium: 'Priority 24/7' },
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center">
                                <span className="text-gray-700">{item.feature}</span>
                                <div className="text-right">
                                    <span className="text-gray-500 text-sm block">Free: {item.free}</span>
                                    <span className="text-teal-600 text-sm font-medium">Premium: {item.premium}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}