<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Get all notifications for authenticated user
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
        
        return response()->json($notifications);
    }
    
    // Get unread count
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();
        
        return response()->json(['count' => $count]);
    }
    
    // Mark single notification as read
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notification->markAsRead();
        
        return response()->json(['message' => 'Marked as read']);
    }
    
    // Mark all notifications as read
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }
    
    // Delete a notification
    public function destroy($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notification->delete();
        
        return response()->json(['message' => 'Notification deleted']);
    }
}