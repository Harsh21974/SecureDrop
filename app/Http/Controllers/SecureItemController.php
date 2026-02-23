<?php

namespace App\Http\Controllers;

use App\Models\SecureItem;
use App\Mail\SecureLinkMail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SecureItemController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:text,file',
            'encrypted_data' => 'required|string',
            'filename' => 'nullable|string',
            'expires_in' => 'nullable|integer|min:1|max:1440',
            'max_views' => 'nullable|integer|min:1|max:100',
            'recipients' => 'nullable|array',
            'recipients.*' => 'email', // validate each email
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
        ]);

        $secureLink = url("/decrypt/{$secureItem->id}");

        // Send emails if provided
        if (!empty($request->recipients)) {
            foreach ($request->recipients as $email) {
                Mail::to($email)->queue(new SecureLinkMail($secureLink));
            }
        }

        return response()->json([
            'link' => $secureLink
        ]);
    }

    public function show($id)
    {
        $item = SecureItem::findOrFail($id);

        // Expiration check
        if ($item->expires_at && now()->greaterThan($item->expires_at)) {
            return response()->json([
                'message' => 'Link has expired.'
            ], 410);
        }

        // View limit check
        if ($item->view_count >= $item->max_views) {
            return response()->json([
                'message' => 'View limit exceeded.'
            ], 403);
        }

        // Increment view count
        $item->increment('view_count');

        return response()->json([
            'type' => $item->type,
            'encrypted_data' => $item->encrypted_data,
            'filename' => $item->filename,
        ]);
    }
}