<?php

namespace App\Http\Controllers;

use App\Models\SecureItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Traits\Notifiable;

class SecureItemController extends Controller
{
    use Notifiable;
    
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:text,file',
            'encrypted_data' => 'required|string',
            'filename' => 'nullable|string',
            'expires_in' => 'nullable|integer|min:1|max:1440',
            'max_views' => 'nullable|integer|min:1|max:100',
            'recipients' => 'required|array|min:1',
            'recipients.*.email' => 'required|email|exists:users,email',
            'recipients.*.encrypted_key' => 'required|string',
            'encryption_type' => 'required|in:public_key',
        ]);

        $user = Auth::guard('sanctum')->user();
        
        // ✅ PREMIUM CHECK: Multi-recipient limit
        $maxRecipients = $user->getMaxRecipients();
        if (count($request->recipients) > $maxRecipients) {
            return response()->json([
                'message' => "You can only send to {$maxRecipients} recipient(s). Free users: 1, Premium users: Unlimited"
            ], 403);
        }
        
        // ✅ PREMIUM CHECK: Monthly message limit for free users
        if ($user->hasReachedMessageLimit()) {
            return response()->json([
                'message' => 'You have reached your monthly message limit (5 messages). Upgrade to premium for unlimited messages.'
            ], 403);
        }
        
        // Check for self-send
        foreach ($request->recipients as $recipientData) {
            if ($recipientData['email'] === $user->email) {
                return response()->json(['message' => 'You cannot send a secure message to yourself'], 400);
            }
        }

        // ✅ PREMIUM CHECK: Text character limit
        if ($request->type === 'text') {
            $decryptedData = base64_decode($request->encrypted_data);
            $maxTextLength = $user->isPremium() ? 50000 : 10000;
            if (strlen($decryptedData) > $maxTextLength) {
                return response()->json([
                    'message' => "Text exceeds {$maxTextLength} character limit. Premium users: 50,000 characters, Free users: 10,000 characters"
                ], 400);
            }
        }
        
        // ✅ PREMIUM CHECK: File size limit
        if ($request->type === 'file') {
            $decryptedData = base64_decode($request->encrypted_data);
            $fileSizeLimit = $user->getFileSizeLimit() * 1024 * 1024;
            if (strlen($decryptedData) > $fileSizeLimit) {
                return response()->json([
                    'message' => "File size exceeds {$user->getFileSizeLimit()}MB limit. Premium users: 50MB, Free users: 20MB"
                ], 400);
            }
        }
        
        // ✅ PREMIUM CHECK: Expiry limit
        $expiresInMinutes = $request->expires_in ?? 1440;
        $maxExpiryDays = $user->getMaxExpiryDays();
        $maxExpiryMinutes = $maxExpiryDays * 24 * 60;
        
        if ($expiresInMinutes > $maxExpiryMinutes) {
            return response()->json([
                'message' => "Expiry cannot exceed {$maxExpiryDays} days. Premium users: 30 days, Free users: 7 days"
            ], 403);
        }
        
        // ✅ PREMIUM CHECK: Max views limit
        $maxViews = $request->max_views ?? 1;
        $maxAllowedViews = $user->isPremium() ? 100 : 10;
        if ($maxViews > $maxAllowedViews) {
            return response()->json([
                'message' => "Max views cannot exceed {$maxAllowedViews}. Premium users: 100, Free users: 10"
            ], 403);
        }
        
        DB::beginTransaction();
        try {
            // Build recipients data with encrypted keys
            $recipientsData = [];
            $encryptedAesKeys = [];
            
            foreach ($request->recipients as $recipientData) {
                $recipient = User::where('email', $recipientData['email'])->first();
                $recipientsData[] = $recipientData['email'];
                $encryptedAesKeys[] = [
                    'user_id' => $recipient->id,
                    'email' => $recipient->email,
                    'encrypted_key' => $recipientData['encrypted_key'],
                    'max_views' => $maxViews,
                    'view_count' => 0,
                    'has_accessed' => false,
                ];
            }
            
            $secureItem = SecureItem::create([
                'type' => $request->type,
                'encrypted_data' => $request->encrypted_data,
                'encrypted_aes_keys' => json_encode($encryptedAesKeys),
                'filename' => $request->filename,
                'expires_at' => Carbon::now()->addMinutes($expiresInMinutes),
                'max_views' => $maxViews,
                'view_count' => 0,
                'recipients' => $recipientsData,
                'user_id' => $user ? $user->id : null,
                'encryption_type' => $request->encryption_type,
            ]);
            
            DB::commit();
            $user->increment('messages_this_month');
            if ($user->message_count_reset_at === null || $user->message_count_reset_at->startOfMonth() < now()->startOfMonth()) {
                $user->update([
                    'messages_this_month' => 1,
                    'message_count_reset_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create secure item: ' . $e->getMessage()], 500);
        }

        $secureLink = url("/decrypt/{$secureItem->token}");
        $emailSent = false;

        foreach ($request->recipients as $recipientData) {
            Mail::send('emails.secure-link', [
                'sender_name' => $user ? $user->name : 'Someone',
                'link' => $secureLink,
            ], function ($message) use ($recipientData) {
                $message->to($recipientData['email'])
                        ->subject('You received a secure message on SecureDrop');
            });
            $emailSent = true;
        }

        // Create in-app notifications for all recipients
        $recipientIds = [];
        foreach ($request->recipients as $recipientData) {
            $recipient = User::where('email', $recipientData['email'])->first();
            $recipientIds[] = $recipient->id;
        }

        $this->createNotificationsForMultipleUsers(
            $recipientIds,
            'secure_message',
            'New Secure Message',
            $user ? $user->name . ' sent you a secure message' : 'Someone sent you a secure message',
            $secureLink,
            $secureItem->token
        );
        
        return response()->json([
            'link' => $secureLink,
            'email_sent' => $emailSent,
            'encryption_type' => $request->encryption_type,
        ]);
    }

    public function show($token)
    {
        $item = SecureItem::where('token', $token)->firstOrFail();

        if (now()->greaterThan($item->expires_at)) {
            return response()->json(['message' => 'Link has expired.'], 410);
        }

        if ($item->view_count >= $item->max_views) {
            return response()->json(['message' => 'View limit exceeded.'], 403);
        }

        return response()->json([
            'status' => 'ready',
            'encryption_type' => $item->encryption_type,
        ]);
    }

    public function decrypt(Request $request, $token)
    {
        $item = SecureItem::where('token', $token)->firstOrFail();

        if (now()->greaterThan($item->expires_at)) {
            return response()->json(['message' => 'Link expired'], 410);
        }

        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Please login to decrypt this message'], 401);
        }
        
        $encryptedAesKeys = json_decode($item->encrypted_aes_keys, true);
        
        // ✅ Add null check
        if (!$encryptedAesKeys || !is_array($encryptedAesKeys)) {
            return response()->json(['message' => 'Invalid encrypted data format'], 400);
        }
        
        $userKeyData = null;
        $userKeyIndex = null;
        
        foreach ($encryptedAesKeys as $index => $keyData) {
            if ($keyData['user_id'] == $user->id || $keyData['email'] == $user->email) {
                $userKeyData = $keyData;
                $userKeyIndex = $index;
                break;
            }
        }
        
        if (!$userKeyData) {
            return response()->json(['message' => 'You are not authorized to decrypt this message'], 403);
        }
        
        // ✅ Check per-recipient view limit - BEFORE incrementing
        $recipientViewCount = $userKeyData['view_count'] ?? 0;
        $recipientMaxViews = $userKeyData['max_views'] ?? $item->max_views;
        
        if ($recipientViewCount >= $recipientMaxViews) {
            return response()->json(['message' => 'Your view limit for this message has been exceeded'], 403);
        }
        
        // ✅ IMPORTANT FIX: Determine if this is a workspace message (direct RSA) or regular message (hybrid AES)
        // Workspace messages have encrypted_data that is DIRECT RSA encrypted (no hybrid structure)
        // Regular messages have encrypted_data that is hybrid (AES key + IV + encrypted data)
        
        // For workspace messages, the encrypted_data IS the encrypted AES key
        // For regular messages, we need to send encrypted_aes_key separately
        
        // Check if this is a workspace message (has secure_item_id in workspace_messages)
        $isWorkspaceMessage = \App\Models\WorkspaceMessage::where('secure_item_id', $item->id)->exists();
        
        if ($isWorkspaceMessage) {
            // Workspace message: encrypted_data is directly the encrypted AES key
            return response()->json([
                'type' => $item->type,
                'encrypted_data' => $item->encrypted_data,
                'filename' => $item->filename,
                'encryption_type' => $item->encryption_type,
                'is_workspace_message' => true,
            ]);
        } else {
            // Regular message: need to increment view count only now (before returning)
            $userKeyData['view_count'] = $recipientViewCount + 1;
            $userKeyData['has_accessed'] = true;
            $encryptedAesKeys[$userKeyIndex] = $userKeyData;
            $item->encrypted_aes_keys = json_encode($encryptedAesKeys);
            $item->save();
            
            $item->increment('view_count');
            
            return response()->json([
                'type' => $item->type,
                'encrypted_data' => $item->encrypted_data,
                'filename' => $item->filename,
                'encryption_type' => $item->encryption_type,
                'encrypted_aes_key' => $userKeyData['encrypted_key'],
            ]);
        }
    }
}