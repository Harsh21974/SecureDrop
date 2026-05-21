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

        // Only check expiration here
        // Recipient-specific view validation happens in decrypt()

        if (now()->greaterThan($item->expires_at)) {
            return response()->json([
                'message' => 'Link has expired.'
            ], 410);
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
        
        $recipientViewCount = $userKeyData['view_count'] ?? 0;
        $recipientMaxViews = $userKeyData['max_views'] ?? $item->max_views;
        
        if ($recipientViewCount >= $recipientMaxViews) {
            return response()->json(['message' => 'Your view limit for this message has been exceeded'], 403);
        }
        
        // Check if this is a workspace message (for response format only)
        $isWorkspaceMessage = \App\Models\WorkspaceMessage::where('secure_item_id', $item->id)->exists();
        
        if ($isWorkspaceMessage) {
            return response()->json([
                'type' => $item->type,
                'encrypted_data' => $item->encrypted_data,
                'filename' => $item->filename,
                'encryption_type' => $item->encryption_type,
                'is_workspace_message' => true,
                'view_count' => $userKeyData['view_count'],
                'max_views' => $recipientMaxViews,
            ]);
        } else {
            return response()->json([
                'type' => $item->type,
                'encrypted_data' => $item->encrypted_data,
                'filename' => $item->filename,
                'encryption_type' => $item->encryption_type,
                'encrypted_aes_key' => $userKeyData['encrypted_key'],
                'view_count' => $userKeyData['view_count'],
                'max_views' => $recipientMaxViews,
            ]);
        }
    }

    public function confirmView(Request $request, $token)
{
    DB::beginTransaction();

    try {
        $item = SecureItem::lockForUpdate()
            ->where('token', $token)
            ->firstOrFail();

        if (now()->greaterThan($item->expires_at)) {
            DB::rollBack();
            return response()->json([
                'message' => 'Link expired'
            ], 410);
        }

        $user = Auth::user();

        if (!$user) {
            DB::rollBack();
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $encryptedAesKeys = json_decode($item->encrypted_aes_keys, true);

        if (!$encryptedAesKeys || !is_array($encryptedAesKeys)) {
            DB::rollBack();
            return response()->json([
                'message' => 'Invalid encrypted data format'
            ], 400);
        }

        $userKeyIndex = null;
        $userKeyData = null;

        foreach ($encryptedAesKeys as $index => $keyData) {
            if (
                $keyData['user_id'] == $user->id ||
                $keyData['email'] == $user->email
            ) {
                $userKeyIndex = $index;
                $userKeyData = $keyData;
                break;
            }
        }

        if (!$userKeyData) {
            DB::rollBack();
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        $recipientViewCount = $userKeyData['view_count'] ?? 0;
        $recipientMaxViews = $userKeyData['max_views'] ?? $item->max_views;

        if ($recipientViewCount >= $recipientMaxViews) {
            DB::rollBack();
            return response()->json([
                'message' => 'View limit exceeded'
            ], 403);
        }

        // Increment recipient-specific count
        $userKeyData['view_count'] = $recipientViewCount + 1;
        $userKeyData['has_accessed'] = true;

        $encryptedAesKeys[$userKeyIndex] = $userKeyData;

        $item->encrypted_aes_keys = json_encode($encryptedAesKeys);

        // Optional global analytics counter
        $item->view_count = $item->view_count + 1;

        $item->save();

        DB::commit();

        return response()->json([
            'success' => true,
            'view_count' => $userKeyData['view_count'],
            'max_views' => $recipientMaxViews,
        ]);

    } catch (\Exception $e) {

        DB::rollBack();

        return response()->json([
            'message' => 'Failed to confirm view',
            'error' => $e->getMessage()
        ], 500);
    }
}
}