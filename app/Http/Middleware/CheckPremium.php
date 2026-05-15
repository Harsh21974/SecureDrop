<?php
// app/Http/Middleware/CheckPremium.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPremium
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user || !$user->isPremium()) {
            return response()->json([
                'message' => 'Premium subscription required for this feature'
            ], 403);
        }
        
        return $next($request);
    }
}