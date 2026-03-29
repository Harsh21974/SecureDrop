<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SecureItem;

class UserItemController extends Controller
{
    //
    public function index(Request $request)
    {
        $items = $request->user()
            ->secureItems()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'type', 'filename', 'created_at', 'expires_at', 'view_count', 'max_views', 'token']);

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
