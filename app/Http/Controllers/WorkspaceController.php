<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WorkspaceController extends Controller
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
     * Check if user can create more workspaces
     */
    private function checkWorkspaceCreationLimit()
    {
        $user = Auth::user();
        $workspaceCount = Workspace::where('owner_id', $user->id)->count();
        
        // Free users: max 3 workspaces, Premium users: unlimited
        $maxWorkspaces = $user->isPremium() ? PHP_INT_MAX : 3;
        
        if ($workspaceCount >= $maxWorkspaces) {
            return response()->json([
                'message' => "You have reached your workspace limit ({$maxWorkspaces}). Premium users have unlimited workspaces. Upgrade to premium to create more workspaces."
            ], 403);
        }
        
        return null;
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        // ✅ PREMIUM CHECK: Limit number of workspaces for free users
        $creationLimitCheck = $this->checkWorkspaceCreationLimit();
        if ($creationLimitCheck) {
            return $creationLimitCheck;
        }

        DB::beginTransaction();
        try {
            $workspace = Workspace::create([
                'name' => $request->name,
                'owner_id' => Auth::id()
            ]);

            WorkspaceMember::create([
                'workspace_id' => $workspace->id,
                'user_id' => Auth::id(),
                'role' => 'owner'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Workspace created successfully',
                'workspace' => $workspace->load('members.user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create workspace: ' . $e->getMessage()], 500);
        }
    }

    public function index()
    {
        $userId = Auth::id();

        $workspaces = Workspace::where('owner_id', $userId)
            ->orWhereHas('members', fn($q) => $q->where('user_id', $userId))
            ->with(['members.user', 'owner'])
            ->get()
            ->map(function($workspace) use ($userId) {
                $member = $workspace->members->firstWhere('user_id', $userId);
                $workspace->user_role = $member ? $member->role : ($workspace->owner_id === $userId ? 'owner' : null);
                return $workspace;
            });

        return response()->json($workspaces);
    }

    public function show($id)
    {
        $workspace = Workspace::with(['members.user', 'owner'])
            ->findOrFail($id);
        
        $userId = Auth::id();
        $member = $workspace->members->firstWhere('user_id', $userId);
        
        if (!$member && $workspace->owner_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $workspace->user_role = $member ? $member->role : 'owner';
        $workspace->can_invite = in_array($workspace->user_role, ['owner', 'admin']);
        $workspace->can_manage = $workspace->user_role === 'owner';
        
        return response()->json($workspace);
    }

    public function removeMember($workspaceId, $memberId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        $currentUser = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$currentUser || !in_array($currentUser->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $member = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('id', $memberId)
            ->firstOrFail();
        
        if ($member->role === 'owner') {
            return response()->json(['message' => 'Cannot remove workspace owner'], 403);
        }
        
        $member->delete();
        
        return response()->json(['message' => 'Member removed successfully']);
    }

    public function updateRole(Request $request, $workspaceId, $memberId)
    {
        $request->validate(['role' => 'required|in:admin,member']);
        
        $currentUser = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$currentUser || $currentUser->role !== 'owner') {
            return response()->json(['message' => 'Only workspace owner can change roles'], 403);
        }
        
        $member = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('id', $memberId)
            ->firstOrFail();
        
        if ($member->role === 'owner') {
            return response()->json(['message' => 'Cannot change owner role'], 403);
        }
        
        $member->update(['role' => $request->role]);
        
        return response()->json(['message' => 'Role updated successfully']);
    }

    public function deleteWorkspace($id)
    {
        $workspace = Workspace::findOrFail($id);
        
        if ($workspace->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Only workspace owner can delete'], 403);
        }
        
        $workspace->delete();
        
        return response()->json(['message' => 'Workspace deleted successfully']);
    }
}