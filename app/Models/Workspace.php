<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'owner_id', 'encrypted_workspace_private_key', 'workspace_public_key'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(WorkspaceMember::class);
    }

    public function invites()
    {
        return $this->hasMany(WorkspaceInvite::class);
    }
    
    public function messages()
    {
        return $this->hasMany(WorkspaceMessage::class);
    }
}