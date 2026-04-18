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
            ->map(function($item) use ($user) {
                // Get user's specific data from encrypted_aes_keys
                $encryptedAesKeys = json_decode($item->encrypted_aes_keys, true);
                $userViewData = null;
                
                if ($encryptedAesKeys) {
                    foreach ($encryptedAesKeys as $keyData) {
                        if ($keyData['user_id'] == $user->id || $keyData['email'] == $user->email) {
                            $userViewData = $keyData;
                            break;
                        }
                    }
                }
                
                return [
                    'id' => $item->id,
                    'token' => $item->token,
                    'type' => $item->type,
                    'filename' => $item->filename,
                    'created_at' => $item->created_at,
                    'expires_at' => $item->expires_at,
                    'max_views' => $userViewData['max_views'] ?? $item->max_views,
                    'view_count' => $userViewData['view_count'] ?? 0,
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
