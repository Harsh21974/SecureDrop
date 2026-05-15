<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_premium',
        'public_key',
        'encrypted_private_key',
        'key_version',
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
    ];

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

    public function hasKeyPair(): bool
    {
        //admin users don't need key pairs, so we return true for them
        if($this->role === 'admin') {
            return true;
        }
        return !empty($this->public_key) && !empty($this->encrypted_private_key);
    }
}