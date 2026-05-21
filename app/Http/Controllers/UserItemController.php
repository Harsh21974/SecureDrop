<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SecureItem;

class UserItemController extends Controller
{
    //
    public function index(Request $request)
    {
        $user = $request->user();
        
        $items = $user->secureItems()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($item) {

                $encryptedAesKeys = json_decode($item->encrypted_aes_keys, true);

                return [
                    'id' => $item->id,
                    'token' => $item->token,
                    'type' => $item->type,
                    'filename' => $item->filename,
                    'created_at' => $item->created_at,
                    'expires_at' => $item->expires_at,

                    // Sender dashboard should use GLOBAL counts
                    'max_views' => $item->max_views,
                    'view_count' => $item->view_count,

                    'recipient_count' => $encryptedAesKeys ? count($encryptedAesKeys) : 1,
                ];
            });
        return response()->json($items);
    }

    public function destroy(Request $request, $token)
    {
        $item = SecureItem::where('token', $token)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $item->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
