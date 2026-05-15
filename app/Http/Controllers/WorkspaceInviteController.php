<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkspaceInvite;
use App\Models\WorkspaceMember;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class WorkspaceInviteController extends Controller
{
    /**
     * Check workspace member limit based on user's premium status
     */
    private function checkWorkspaceMemberLimit($workspaceId)
    {
        $user = Auth::user();
        $currentMemberCount = WorkspaceMember::where('workspace_id', $workspaceId)->count();
        $maxMembers = $user->getMaxWorkspaceMembers();
        
        if ($currentMemberCount >= $maxMembers && $maxMembers !== PHP_INT_MAX) {
            return response()->json([
                'message' => "Workspace member limit reached ({$maxMembers}). Premium users have unlimited members. Upgrade to premium to add more members."
            ], 403);
        }
        
        return null;
    }

    /**
     * Send workspace invitation to a user
     */
    public function sendInvite(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
            'email' => 'required|email|max:255'
        ]);

        $workspace = Workspace::findOrFail($request->workspace_id);
        
        // ✅ PREMIUM CHECK: Check member limit before sending invite
        $memberLimitCheck = $this->checkWorkspaceMemberLimit($workspace->id);
        if ($memberLimitCheck) {
            return $memberLimitCheck;
        }
        
        // Check if current user has permission to invite
        $currentMember = WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', Auth::id())
            ->first();
        
        // Only owner and admins can invite
        if (!$currentMember || !in_array($currentMember->role, ['owner', 'admin'])) {
            return response()->json([
                'message' => 'Only workspace owners and admins can send invitations'
            ], 403);
        }

        // Check if email is already a member
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            $isMember = WorkspaceMember::where('workspace_id', $workspace->id)
                ->where('user_id', $existingUser->id)
                ->exists();
            
            if ($isMember) {
                return response()->json([
                    'message' => 'User is already a member of this workspace'
                ], 400);
            }
        }

        // Check for existing pending invite
        $existingInvite = WorkspaceInvite::where('workspace_id', $workspace->id)
            ->where('email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existingInvite) {
            return response()->json([
                'message' => 'An invitation has already been sent to this email'
            ], 400);
        }

        // Create new invitation
        $token = Str::random(64);
        
        $invite = WorkspaceInvite::create([
            'workspace_id' => $workspace->id,
            'email' => $request->email,
            'token' => $token,
            'status' => 'pending',
            'expires_at' => now()->addDays(7) // 7 days expiry
        ]);

        // Generate accept URL
        $acceptUrl = config('app.url') . "/accept-invite/{$token}";

        // Send email notification
        try {
            Mail::send('emails.workspace-invite', [
                'workspace_name' => $workspace->name,
                'invited_by' => Auth::user()->name,
                'accept_url' => $acceptUrl,
                'expires_at' => $invite->expires_at->format('F j, Y'),
                'email' => $request->email
            ], function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('You\'re invited to join a workspace on SecureDrop');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send invite email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Invitation sent successfully',
            'invite' => [
                'email' => $invite->email,
                'expires_at' => $invite->expires_at
            ]
        ]);
    }

    /**
     * Get invitation details for the accept page
     */
    public function getInviteDetails($token)
    {
        $invite = WorkspaceInvite::where('token', $token)
            ->where('status', 'pending')
            ->with('workspace')
            ->first();

        if (!$invite) {
            return response()->json([
                'message' => 'Invalid or expired invitation link'
            ], 404);
        }

        if ($invite->expires_at && now()->greaterThan($invite->expires_at)) {
            $invite->update(['status' => 'expired']);
            return response()->json([
                'message' => 'This invitation has expired'
            ], 410);
        }

        // Get inviter name
        $inviter = User::find($invite->workspace->owner_id);
        
        // Check if recipient already has an account
        $hasAccount = User::where('email', $invite->email)->exists();

        return response()->json([
            'workspace_id' => $invite->workspace_id,
            'workspace_name' => $invite->workspace->name,
            'invited_by' => $inviter ? $inviter->name : 'Workspace Owner',
            'invited_email' => $invite->email,
            'expires_at' => $invite->expires_at,
            'has_account' => $hasAccount,
            'token' => $token
        ]);
    }

    /**
     * Accept the workspace invitation
     */
    public function acceptInvite(Request $request, $token)
    {
        $invite = WorkspaceInvite::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invite) {
            return response()->json([
                'message' => 'Invalid invitation link'
            ], 404);
        }

        if ($invite->expires_at && now()->greaterThan($invite->expires_at)) {
            $invite->update(['status' => 'expired']);
            return response()->json([
                'message' => 'This invitation has expired'
            ], 410);
        }

        // Get or create user
        $user = User::where('email', $invite->email)->first();
        
        if (!$user) {
            // User needs to register first
            return response()->json([
                'message' => 'Please register an account with this email address first',
                'requires_registration' => true,
                'email' => $invite->email,
                'invite_token' => $token
            ], 400);
        }

        // ✅ PREMIUM CHECK: Check member limit before accepting (for the workspace owner)
        $workspace = Workspace::find($invite->workspace_id);
        $memberLimitCheck = $this->checkWorkspaceMemberLimit($workspace->id);
        if ($memberLimitCheck) {
            return $memberLimitCheck;
        }

        // Check if already a member
        $existingMember = WorkspaceMember::where('workspace_id', $invite->workspace_id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingMember) {
            $invite->update(['status' => 'accepted']);
            return response()->json([
                'message' => 'You are already a member of this workspace',
                'already_member' => true
            ]);
        }

        // Add user to workspace
        WorkspaceMember::create([
            'workspace_id' => $invite->workspace_id,
            'user_id' => $user->id,
            'role' => 'member'
        ]);

        // Update invite status
        $invite->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Successfully joined the workspace',
            'workspace_id' => $invite->workspace_id
        ]);
    }

    /**
     * Get all pending invitations for authenticated user
     */
    public function getPendingInvites(Request $request)
    {
        $user = Auth::user();
        
        $pendingInvites = WorkspaceInvite::where('email', $user->email)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->with('workspace')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($invite) {
                return [
                    'id' => $invite->id,
                    'workspace_id' => $invite->workspace_id,
                    'workspace_name' => $invite->workspace->name,
                    'token' => $invite->token,
                    'expires_at' => $invite->expires_at,
                    'invited_at' => $invite->created_at,
                ];
            });
        
        return response()->json($pendingInvites);
    }

    /**
     * Decline/Cancel invitation
     */
    public function declineInvite($id)
    {
        $invite = WorkspaceInvite::findOrFail($id);
        $user = Auth::user();
        
        // Verify this invite belongs to the authenticated user
        if ($invite->email !== $user->email) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $invite->update(['status' => 'declined']);
        
        return response()->json(['message' => 'Invitation declined']);
    }
    
    /**
     * Resend an expired invitation
     */
    public function resendInvite(Request $request)
    {
        $request->validate([
            'invite_id' => 'required|exists:workspace_invites,id'
        ]);

        $invite = WorkspaceInvite::findOrFail($request->invite_id);
        $workspace = Workspace::findOrFail($invite->workspace_id);
        
        // Check permission
        $currentMember = WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$currentMember || !in_array($currentMember->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Generate new token
        $newToken = Str::random(64);
        $invite->update([
            'token' => $newToken,
            'status' => 'pending',
            'expires_at' => now()->addDays(7)
        ]);

        $acceptUrl = config('app.url') . "/accept-invite/{$newToken}";

        // Resend email
        Mail::send('emails.workspace-invite', [
            'workspace_name' => $workspace->name,
            'invited_by' => Auth::user()->name,
            'accept_url' => $acceptUrl,
            'expires_at' => $invite->expires_at->format('F j, Y'),
            'email' => $invite->email
        ], function ($message) use ($invite) {
            $message->to($invite->email)
                    ->subject('You\'re invited to join a workspace on SecureDrop');
        });

        return response()->json(['message' => 'Invitation resent successfully']);
    }

    /**
     * Cancel a pending invitation
     */
    public function cancelInvite($id)
    {
        $invite = WorkspaceInvite::findOrFail($id);
        $workspace = Workspace::findOrFail($invite->workspace_id);
        
        // Check permission
        $currentMember = WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$currentMember || !in_array($currentMember->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invite->delete();

        return response()->json(['message' => 'Invitation cancelled successfully']);
    }

    /**
     * Get all pending invitations for a workspace
     */
    public function getWorkspaceInvites($workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check permission
        $currentMember = WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$currentMember || !in_array($currentMember->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invites = WorkspaceInvite::where('workspace_id', $workspaceId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invites);
    }
}