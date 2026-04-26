<?php

namespace App\Traits;

use App\Models\Notification;
use App\Models\User;

trait Notifiable
{
    protected function createNotification($userId, $type, $title, $message, $link = null, $relatedId = null)
    {
        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'related_id' => $relatedId,
            'is_read' => false,
        ]);
    }
    
    protected function createNotificationsForMultipleUsers($userIds, $type, $title, $message, $link = null, $relatedId = null)
    {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notifications[] = [
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link,
                'related_id' => $relatedId,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        Notification::insert($notifications);
    }
}