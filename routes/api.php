<?php

use App\Http\Controllers\SecureItemController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserItemController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/secure-items', [SecureItemController::class, 'store']);
Route::get('/secure-items/{token}', [SecureItemController::class, 'show']);
Route::post('/decrypt/{token}', [SecureItemController::class, 'decrypt']);

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/my-items', [UserItemController::class, 'index']);
    Route::delete('/my-items/{token}', [UserItemController::class, 'destroy']);
});

// Admin routes - FIXED
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->group(function () {
    Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
    
    Route::apiResource('users', App\Http\Controllers\Admin\UserController::class);
    Route::get('/users/{user}/items', [App\Http\Controllers\Admin\UserController::class, 'items']);
    
    Route::apiResource('secure-items', App\Http\Controllers\Admin\SecureItemController::class);
    Route::patch('/secure-items/{id}/revoke', [App\Http\Controllers\Admin\SecureItemController::class, 'revoke']);
});

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login');