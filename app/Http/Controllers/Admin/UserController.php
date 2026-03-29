<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    //
    public function index(Request $request)
    {
         $users = User::orderBy('created_at', 'desc')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,admin',
            'is_premium' => 'sometimes|boolean',
        ]);

        $user->update($request->only(['name', 'email', 'role', 'is_premium']));

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function items($id)
    {
        $user = User::findOrFail($id);
        $items = $user->secureItems()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'type', 'filename', 'created_at', 'expires_at', 'view_count', 'max_views', 'token']);
        
        return response()->json($items);
    }
}
