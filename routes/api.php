<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SecureItemController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserItemController;

// Workspace Controllers
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceInviteController;
use App\Http\Controllers\KeyController;
use App\Http\Controllers\WorkspaceMessageController;
use App\Http\Controllers\NotificationController;

Route::post('/secure-items', [SecureItemController::class, 'store']);
Route::get('/secure-items/{token}', [SecureItemController::class, 'show']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/invite-details/{token}', [WorkspaceInviteController::class, 'getInviteDetails']);
Route::post('/accept-invite/{token}', [WorkspaceInviteController::class, 'acceptInvite']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // User items
    Route::get('/my-items', [UserItemController::class, 'index']);
    Route::delete('/my-items/{token}', [UserItemController::class, 'destroy']);

    // Create workspace
    Route::post('/workspaces', [WorkspaceController::class, 'store']);

    // List user workspaces
    Route::get('/workspaces', [WorkspaceController::class, 'index']);

    // Send invite
    Route::post('/workspace/invite', [WorkspaceInviteController::class, 'sendInvite']);

    Route::get('/workspaces/{id}', [WorkspaceController::class, 'show']);
    Route::delete('/workspaces/{id}/members/{memberId}', [WorkspaceController::class, 'removeMember']);
    Route::put('/workspaces/{id}/members/{memberId}/role', [WorkspaceController::class, 'updateRole']);
    Route::delete('/workspaces/{id}', [WorkspaceController::class, 'deleteWorkspace']);
    Route::get('/pending-invites', [WorkspaceInviteController::class, 'getPendingInvites']);
    Route::delete('/pending-invites/{id}', [WorkspaceInviteController::class, 'declineInvite']);

    // Key management routes
    Route::get('/keys/public', [KeyController::class, 'getPublicKey']);
    Route::get('/keys/my-private', [KeyController::class, 'getMyPrivateKey']);
    Route::put('/keys', [KeyController::class, 'updateKeys']);
    Route::get('/users/search', [KeyController::class, 'searchUsers']);

    Route::get('/users/{id}', [KeyController::class, 'getUserById']);

    // Workspace Messages
    Route::get('/workspaces/{workspaceId}/messages', [WorkspaceMessageController::class, 'index']);
    Route::post('/workspaces/{workspaceId}/messages', [WorkspaceMessageController::class, 'store']);
    Route::post('/workspaces/{workspaceId}/messages/{messageId}/read', [WorkspaceMessageController::class, 'markAsRead']);
    Route::delete('/workspaces/{workspaceId}/messages/{messageId}', [WorkspaceMessageController::class, 'destroy']);

    // ✅ MOVED DECRYPT ROUTE INSIDE AUTH GROUP
    Route::post('/decrypt/{token}', [SecureItemController::class, 'decrypt']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});


Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])
    ->prefix('admin')
    ->group(function () {

        Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);

        Route::apiResource('users', App\Http\Controllers\Admin\UserController::class);
        Route::get('/users/{user}/items', [App\Http\Controllers\Admin\UserController::class, 'items']);

        Route::apiResource('secure-items', App\Http\Controllers\Admin\SecureItemController::class);
        Route::patch('/secure-items/{id}/revoke', [App\Http\Controllers\Admin\SecureItemController::class, 'revoke']);
    });

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login');