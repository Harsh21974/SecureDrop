<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SecureItem extends Model
{
    // public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'type',
        'encrypted_data',
        'filename',
        'expires_at',
        'max_views',
        'view_count',
        'recipients',
        'token',
        'password',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'recipients' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
            $model->token = Str::random(40);
        });
    }
}