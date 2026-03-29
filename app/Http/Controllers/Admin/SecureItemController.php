<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SecureItem;

class SecureItemController extends Controller
{
    //
    public function index(Request $request)
    {
        $items = SecureItem::with('user')
            ->orderBy('created_at', 'desc')
            ->when($request->search, function ($query, $search) {
                $query->where('token', 'like', "%{$search}%")
                      ->orWhere('filename', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    $query->where('expires_at', '>', now())
                          ->whereRaw('view_count < max_views');
                } elseif ($status === 'expired') {
                    $query->where('expires_at', '<=', now());
                } elseif ($status === 'used') {
                    $query->where('view_count', '>=', 'max_views');
                }
            })
            ->paginate(15);

        return response()->json($items);
    }

    public function show($token)
    {
        $item = SecureItem::where('token', $token)->firstOrFail();
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = SecureItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function revoke($id)
    {
        $item = SecureItem::findOrFail($id);
        $item->update(['expires_at' => now()]);
        return response()->json(['message' => 'Item revoked (expired now)']);
    }
}
