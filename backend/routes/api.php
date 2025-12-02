<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\DonationItemController;
use App\Http\Controllers\CharityController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ViewUserController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for your React front-end SPA and existing tests.
|
*/

// Test & debug endpoints
Route::get('/status', function () {
    return response()->json(['message' => 'Laravel API working']);
});
Route::get('/test-db', function () {
    return response()->json([
        'tables' => DB::select("SELECT name FROM sqlite_master WHERE type='table'")
    ]);
});
Route::get('/users', function () {
    return DB::table('users')->get();
});
//end of testing routes


// AUTH routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/logout', [AuthController::class, 'logout']);

// Inventory routes
Route::get('/inventory', [InventoryController::class, 'index']);
Route::get('/inventory/{id}', [InventoryController::class, 'show']);

// Donations
Route::get('/donations', [DonationController::class, 'getAllDonations']); 
Route::get('/donations/{id}', [DonationController::class, 'show']);
Route::post('/donations', [DonationController::class, 'store']);
Route::get('/donations/user/{donorId}', [DonationController::class, 'getUserDonations']);
Route::post('/donations/{donationId}/status', [DonationController::class, 'updateStatus']);

// Donation items
Route::get('/donation-items', [DonationItemController::class, 'index']);
Route::get('/donation-items/{id}', [DonationItemController::class, 'show']);

// Charities
Route::get('/charities', [CharityController::class, 'index']);
Route::get('/charities/{id}', [CharityController::class, 'show']);
Route::post('/charities', [CharityController::class, 'store']);

// Charity — Get all donations assigned to this charity
Route::get('/charity/{charityId}/donations', [DonationController::class, 'getCharityDonations']);


// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/donations',  [AdminController::class, 'getAllDonations']);
    Route::get('/charities',  [AdminController::class, 'getAllCharities']);
    Route::get('/users',      [AdminController::class, 'getAllUsers']);
    Route::get('/stats',      [AdminController::class, 'getDashboardStats']);
    
});

Route::get('/view-users',      [ViewUserController::class, 'getViewUsers']);