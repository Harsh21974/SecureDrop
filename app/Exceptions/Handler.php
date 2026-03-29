<?php

namespace App\Exceptions;
use Illuminate\Auth\AuthenticationException;

use Exception;

class Handler extends Exception
{
    //
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $exception->getMessage()], 401);
        }
        return redirect()->guest($exception->redirectTo() ?? route('login'));
    }
}
