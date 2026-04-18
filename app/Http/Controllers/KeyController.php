<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KeyController extends Controller
{
    // Get public key for a user by email
    public function getPublicKey(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user->public_key) {
            return response()->json([
                'message' => 'User has not set up encryption keys'
            ], 404);
        }

        return response()->json([
            'public_key' => $user->public_key,
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }

    // Get current user's encrypted private key (for multi-device sync)
    public function getMyPrivateKey(Request $request)
    {
        $user = Auth::user();

        if (!$user->encrypted_private_key) {
            return response()->json([
                'message' => 'No private key found'
            ], 404);
        }

        return response()->json([
            'encrypted_private_key' => $user->encrypted_private_key,
            'key_version' => $user->key_version,
        ]);
    }

    // Update keys (for multi-device or key rotation)
    public function updateKeys(Request $request)
    {
        $request->validate([
            'public_key' => 'required|string',
            'encrypted_private_key' => 'required|string',
        ]);

        $user = Auth::user();
        
        $user->update([
            'public_key' => $request->public_key,
            'encrypted_private_key' => $request->encrypted_private_key,
            'key_version' => (string)((int)$user->key_version + 1),
        ]);

        return response()->json([
            'message' => 'Keys updated successfully'
        ]);
    }

    // Search users by email (for recipient selector)
    public function searchUsers(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $currentUser = Auth::id();

        $users = User::where('email', 'like', '%' . $request->query . '%')
            ->orWhere('name', 'like', '%' . $request->query . '%')
            ->where('id', '!=', $currentUser)
            ->whereNotNull('public_key')
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json($users);
    }
    // Get user by ID
    public function getUserById($id)
    {
        $user = User::findOrFail($id);
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'public_key' => $user->public_key,
        ]);
    }
}