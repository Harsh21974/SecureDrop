<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SecureItem;

class DashboardController extends Controller
{
    //
    public function stats()
    {
        try {
            $totalUsers = User::count();
            $totalItems = SecureItem::count();
            $activeItems = SecureItem::where('expires_at', '>', now())
                ->whereRaw('COALESCE(view_count, 0) < COALESCE(max_views, 0)')
                ->count();
            $expiredItems = SecureItem::where('expires_at', '<=', now())->count();
            $usedItems = SecureItem::whereRaw('COALESCE(view_count, 0) >= COALESCE(max_views, 0)')
                ->count();

            $recentUsers = User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);
            $recentItems = SecureItem::with('user')
                ->take(5)
                ->get(['id', 'token', 'type', 'filename', 'created_at', 'user_id']);

            return response()->json([
                'total_users' => $totalUsers,
                'total_items' => $totalItems,
                'active_items' => $activeItems,
                'expired_items' => $expiredItems,
                'used_items' => $usedItems,
                'recent_users' => $recentUsers,
                'recent_items' => $recentItems,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
