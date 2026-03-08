<?php

namespace App\Http\Controllers;

use App\Models\SecureItem;
use App\Mail\SecureLinkMail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SecureItemController extends Controller
{
    // ==========================
    // CREATE SECURE ITEM
    // ==========================
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:text,file',
            'encrypted_data' => 'required|string',
            'filename' => 'nullable|string',
            'password' => 'required|string|min:6', // ✅ ADD
            'expires_in' => 'nullable|integer|min:1|max:1440',
            'max_views' => 'nullable|integer|min:1|max:100',
            'recipients' => 'nullable|array',
            'recipients.*' => 'email',
        ]);

        $expiresInMinutes = $request->expires_in ?? 1440;

        $secureItem = SecureItem::create([
            'type' => $request->type,
            'encrypted_data' => $request->encrypted_data,
            'filename' => $request->filename,
            'expires_at' => Carbon::now()->addMinutes($expiresInMinutes),
            'max_views' => $request->max_views ?? 1,
            'view_count' => 0,
            'recipients' => $request->recipients,
            'password' => Hash::make($request->password), // ✅ HASH PASSWORD
        ]);

        // ✅ USE TOKEN NOT ID
        $secureLink = url("/decrypt/{$secureItem->token}");

        $emailSent = false;

        if (!empty($request->recipients)) {
            foreach ($request->recipients as $email) {
                Mail::to($email)->send(new SecureLinkMail($secureLink));
            }
            $emailSent = true;
        }

        return response()->json([
            'link' => $secureLink,
            'email_sent' => $emailSent
        ]);
    }

    // ==========================
    // CHECK LINK (NO INCREMENT)
    // ==========================
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
            'status' => 'ready'
        ]);
    }

    // ==========================
    // DECRYPT (INCREMENT ONLY AFTER PASSWORD SUCCESS)
    // ==========================
    public function decrypt(Request $request, $token)
    {
        $request->validate([
            'password' => 'required'
        ]);

        return DB::transaction(function () use ($request, $token) {
            $item = SecureItem::where('token', $token)
                ->lockForUpdate()
                ->firstOrFail();

            if (now()->greaterThan($item->expires_at)) {
                return response()->json(['message' => 'Link expired'], 410);
            }

            if ($item->view_count >= $item->max_views) {
                return response()->json(['message' => 'View limit exceeded'], 403);
            }

            if (!Hash::check($request->password, $item->password)) {
                return response()->json(['message' => 'Incorrect password'], 401);
            }

            // ✅ ONLY NOW increment
            $item->increment('view_count');

            return response()->json([
                'type' => $item->type,
                'encrypted_data' => $item->encrypted_data,
                'filename' => $item->filename,
            ]);
        });
    }
}