<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_premium',
        'public_key',
        'encrypted_private_key',
        'key_version',
        // Stripe subscription fields
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscription_status',
        'subscription_ends_at',
        'plan_type',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'encrypted_private_key',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_premium' => 'boolean',
        'subscription_ends_at' => 'datetime',
    ];

    // ========== Relationships ==========
    
    public function secureItems()
    {
        return $this->hasMany(SecureItem::class);
    }

    public function sentItems()
    {
        return $this->hasMany(SecureItem::class, 'user_id');
    }

    public function receivedItems()
    {
        return $this->hasMany(SecureItem::class, 'recipient_id');
    }

    public function paymentMethods()
    {
        return $this->hasMany(PaymentMethod::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function defaultPaymentMethod()
    {
        return $this->hasOne(PaymentMethod::class)->where('is_default', true);
    }

    // ========== Subscription Helper Methods ==========
    
    /**
     * Check if user has an active subscription
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscription_status === 'active' 
            && ($this->subscription_ends_at === null || $this->subscription_ends_at > now());
    }
    
    /**
     * Check if user has a cancelled but still active subscription (until period end)
     */
    public function hasCancelledButActiveSubscription(): bool
    {
        return $this->subscription_status === 'cancelled' 
            && $this->subscription_ends_at !== null 
            && $this->subscription_ends_at > now();
    }
    
    /**
     * Check if subscription has expired
     */
    public function hasExpiredSubscription(): bool
    {
        return $this->subscription_status === 'cancelled' 
            && $this->subscription_ends_at !== null 
            && $this->subscription_ends_at <= now();
    }
    
    /**
     * Check if user has premium access (either manual premium or active subscription)
     */
    public function isPremium(): bool
    {
        return $this->is_premium || $this->hasActiveSubscription() || $this->hasCancelledButActiveSubscription();
    }
    
    /**
     * Get subscription plan type (monthly/yearly)
     */
    public function getPlanType(): ?string
    {
        return $this->plan_type;
    }
    
    /**
     * Get subscription status text for display
     */
    public function getSubscriptionStatusText(): string
    {
        if ($this->is_premium && !$this->stripe_subscription_id) {
            return 'Lifetime Premium';
        }
        
        if ($this->hasActiveSubscription()) {
            return 'Active';
        }
        
        if ($this->hasCancelledButActiveSubscription()) {
            $daysLeft = $this->subscriptionEndsInDays();
            return "Cancelled (ends in {$daysLeft} days)";
        }
        
        if ($this->subscription_status === 'past_due') {
            return 'Past Due - Action Required';
        }
        
        if ($this->hasExpiredSubscription()) {
            return 'Expired';
        }
        
        return 'Inactive';
    }
    
    /**
     * Get days until subscription ends
     */
    public function subscriptionEndsInDays(): ?int
    {
        if (!$this->subscription_ends_at) {
            return null;
        }
        
        $diff = now()->diffInDays($this->subscription_ends_at, false);
        return $diff >= 0 ? $diff : 0;
    }
    
    /**
     * Update subscription status from Stripe webhook
     */
    public function updateSubscriptionStatus(string $status, ?string $endsAt = null): void
    {
        $this->subscription_status = $status;
        
        if ($endsAt) {
            $this->subscription_ends_at = $endsAt;
        }
        
        // Update is_premium based on active status
        if (!$this->is_premium && ($status === 'active' || ($status === 'cancelled' && $this->subscription_ends_at > now()))) {
            $this->is_premium = true;
        } elseif ($status === 'inactive' || ($status === 'cancelled' && $this->subscription_ends_at <= now())) {
            $this->is_premium = false;
        }
        
        $this->save();
    }
    
    /**
     * Check if user has a valid payment method on file
     */
    public function hasPaymentMethod(): bool
    {
        return $this->paymentMethods()->exists();
    }
    
    /**
     * Get user's default payment method
     */
    public function getDefaultPaymentMethod()
    {
        return $this->paymentMethods()->where('is_default', true)->first();
    }
    
    // ========== Key Management Helper Methods ==========
    
    /**
     * Check if user has generated encryption keys
     */
    public function hasKeyPair(): bool
    {
        return !empty($this->public_key) && !empty($this->encrypted_private_key);
    }
    
    /**
     * Get key version
     */
    public function getKeyVersion(): int
    {
        return (int)($this->key_version ?? 1);
    }
    
    // ========== Workspace Helper Methods ==========
    
    /**
     * Get all workspaces where user is a member
     */
    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members', 'user_id', 'workspace_id')
            ->withPivot('role')
            ->withTimestamps();
    }
    
    /**
     * Get workspace member record for a specific workspace
     */
    public function workspaceMember($workspaceId)
    {
        return WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $this->id)
            ->first();
    }
    
    /**
     * Check if user is owner of a workspace
     */
    public function isWorkspaceOwner($workspaceId): bool
    {
        $workspace = Workspace::find($workspaceId);
        return $workspace && $workspace->owner_id === $this->id;
    }
    /**
 * Get formatted subscription end date
 */
    public function getFormattedSubscriptionEndDate(): ?string
    {
        if (!$this->subscription_ends_at) {
            return null;
        }
        
        return $this->subscription_ends_at->format('F j, Y');
    }
   
    /**
     * Get user's file size limit in MB
     */
    public function getFileSizeLimit(): int
    {
        return $this->isPremium() ? 50 : 20; // 50MB for premium, 5MB for free
    }
    

    /**
     * Get user's max recipients per message
     */
    public function getMaxRecipients(): int
    {
        return $this->isPremium() ? 20 : 1; // 20 recipients for premium, 1 for free
    }

    /**
     * Get user's max workspace members
     */
    public function getMaxWorkspaceMembers(): int
    {
        return $this->isPremium() ? PHP_INT_MAX : 3; // Unlimited for premium, 3 for free
    }

    /**
     * Get user's max messages per month
     */
    public function getMaxMessagesPerMonth(): int
    {
        return $this->isPremium() ? PHP_INT_MAX : 5; // Unlimited for premium, 5 for free
    }

    /**
     * Get user's max expiry days
     */
    public function getMaxExpiryDays(): int
    {
        return $this->isPremium() ? 30 : 7; // 30 days for premium, 7 for free
    }

    /**
     * Check if user has reached monthly message limit
     */
    public function hasReachedMessageLimit(): bool
    {
        if ($this->isPremium()) {
            return false;
        }
        
        $currentMonth = now()->startOfMonth();
        $messageCount = SecureItem::where('user_id', $this->id)
            ->where('created_at', '>=', $currentMonth)
            ->count();
        
        return $messageCount >= 5;
    }
}
