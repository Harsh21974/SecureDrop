<?php

namespace App\Http\Controllers;

use App\Models\SecureItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SecureItemController extends Controller
{
    // CREATE SECURE ITEM - Modified for public key encryption
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:text,file',
            'encrypted_data' => 'required|string',
            'filename' => 'nullable|string',
            'expires_in' => 'nullable|integer|min:1|max:1440',
            'max_views' => 'nullable|integer|min:1|max:100',
            'recipient_email' => 'nullable|email|exists:users,email',
            'encryption_type' => 'required|in:password,public_key',
        ]);

        // For password-based encryption (legacy support)
        if ($request->encryption_type === 'password') {
            $request->validate([
                'password' => 'required|string|min:6',
            ]);
        }

        // Text length validation
        if ($request->type === 'text') {
            $decryptedData = base64_decode($request->encrypted_data);
            if (strlen($decryptedData) > 50000) {
                return response()->json([
                    'message' => 'Text exceeds 50,000 character limit'
                ], 400);
            }
        }

        $expiresInMinutes = $request->expires_in ?? 1440;
        $user = Auth::guard('sanctum')->user();
        
        // Find recipient if public key encryption
        $recipientId = null;
        if ($request->encryption_type === 'public_key' && $request->recipient_email) {
            $recipient = User::where('email', $request->recipient_email)->first();
            if ($recipient && $recipient->public_key) {
                $recipientId = $recipient->id;
            } else {
                return response()->json([
                    'message' => 'Recipient does not have encryption keys set up'
                ], 400);
            }
        }

        $secureItem = SecureItem::create([
            'type' => $request->type,
            'encrypted_data' => $request->encrypted_data,
            'filename' => $request->filename,
            'expires_at' => Carbon::now()->addMinutes($expiresInMinutes),
            'max_views' => $request->max_views ?? 1,
            'view_count' => 0,
            'recipients' => $request->recipient_email ? [$request->recipient_email] : null,
            //'password' => $request->encryption_type === 'password' ? Hash::make($request->password) : null,
            'user_id' => $user ? $user->id : null,
            'recipient_id' => $recipientId,
            'encryption_type' => $request->encryption_type,
        ]);

        $secureLink = url("/decrypt/{$secureItem->token}");
        $emailSent = false;

        // Send email notification if recipient provided
        if ($request->recipient_email) {
            Mail::send('emails.secure-link', [
                'sender_name' => $user ? $user->name : 'Someone',
                'link' => $secureLink,
            ], function ($message) use ($request) {
                $message->to($request->recipient_email)
                        ->subject('You received a secure message on SecureDrop');
            });
            $emailSent = true;
        }

        return response()->json([
            'link' => $secureLink,
            'email_sent' => $emailSent,
            'encryption_type' => $request->encryption_type,
        ]);
    }

    // CHECK LINK (No changes)
    public function show($token)
    {
        $item = SecureItem::where('token', $token)->firstOrFail();

        if (now()->greaterThan($item->expires_at)) {
            return response()->json([
                'message' => 'Link has expired.'
            ], 410);
        }

        if ($item->view_count >= $item->max_views) {
            return response()->json([
                'message' => 'View limit exceeded.'
            ], 403);
        }

        return response()->json([
            'status' => 'ready',
            'encryption_type' => $item->encryption_type,
        ]);
    }

    // DECRYPT - Modified to handle both encryption types
    public function decrypt($token)
    {
        $item = SecureItem::where('token', $token)->first();

        if (!$item) {
            return response()->json(['message' => 'Invalid link'], 404);
        }

        if ($item->expires_at < now()) {
            return response()->json(['message' => 'Link expired'], 400);
        }

        if ($item->view_count >= $item->max_views) {
            return response()->json(['message' => 'View limit exceeded'], 400);
        }

        // Increment views
        $item->increment('view_count');

        return response()->json([
            'encrypted_data' => $item->encrypted_data,
            'type' => $item->type,
            'filename' => $item->filename,
        ]);
    }
}