<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkspaceMember extends Model
{
    use HasFactory;

    protected $fillable = ['workspace_id', 'user_id', 'role', 'encrypted_workspace_private_key'];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function canInvite(): bool
    {
        return in_array($this->role, ['owner', 'admin']);
    }

    public function canRemoveMembers(): bool
    {
        return in_array($this->role, ['owner', 'admin']);
    }

    public function canDeleteWorkspace(): bool
    {
        return $this->role === 'owner';
    }
}