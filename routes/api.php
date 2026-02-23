<?php

use App\Http\Controllers\SecureItemController;
use Illuminate\Support\Facades\Route;

Route::post('/secure-items', [SecureItemController::class, 'store']);
Route::get('/secure-items/{id}', [SecureItemController::class, 'show']);
Route::post('/secure-items/{id}/mark-accessed', [SecureItemController::class, 'markAccessed']);