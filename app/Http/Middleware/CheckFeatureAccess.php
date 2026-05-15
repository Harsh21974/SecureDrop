<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckFeatureAccess
{
    public function handle(Request $request, Closure $next, $feature)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        switch ($feature) {
            case 'file_upload':
                $maxSize = $user->getFileSizeLimit();
                if ($request->hasFile('file')) {
                    $fileSize = $request->file('file')->getSize();
                    if ($fileSize > $maxSize * 1024 * 1024) {
                        return response()->json([
                            'message' => "File size exceeds limit. Premium users can upload up to {$maxSize}MB. Free users: 5MB"
                        ], 403);
                    }
                }
                break;
                
            case 'multi_recipient':
                if (!$user->isPremium()) {
                    return response()->json([
                        'message' => 'Multi-recipient messages are only available for premium users'
                    ], 403);
                }
                break;
                
            case 'workspace_member':
                // Check workspace member limit will be handled in workspace controller
                break;
        }
        
        return $next($request);
    }
}