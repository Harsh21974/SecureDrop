<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkspaceInvite extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'email',
        'token',
        'status',
        'expires_at'
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
}
