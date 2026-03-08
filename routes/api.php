<?php

use App\Http\Controllers\SecureItemController;
use Illuminate\Support\Facades\Route;

Route::post('/secure-items', [SecureItemController::class, 'store']);
Route::get('/secure-items/{token}', [SecureItemController::class, 'show']);
Route::post('/decrypt/{token}', [SecureItemController::class, 'decrypt']);