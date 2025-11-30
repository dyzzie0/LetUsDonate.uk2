<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\DonationItemController;
use App\Http\Controllers\CharityController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for your React front-end SPA and existing tests.
|
*/
//charity — Get all donations assigned to this charity
Route::get('/charity/{charityId}/donations', [DonationController::class, 'getCharityDonations']);
Route::get('/donations-all', [DonationController::class, 'getAllDonations']);



// test & debug ENDPOINTS
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


// AUTH routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/logout', [AuthController::class, 'logout']);


// inventory
Route::get('/inventory', [InventoryController::class, 'index']);
Route::get('/inventory/{id}', [InventoryController::class, 'show']);


// donations
Route::get('/donations', [DonationController::class, 'index']);
Route::get('/donations/{id}', [DonationController::class, 'show']);
Route::post('/donations', [DonationController::class, 'store']);
Route::get('/donations/user/{donorId}', [DonationController::class, 'getUserDonations']);
Route::post('/donations/{donationId}/status', [DonationController::class, 'updateStatus']);





//donation items
Route::get('/donation-items', [DonationItemController::class, 'index']);
Route::get('/donation-items/{id}', [DonationItemController::class, 'show']);


//charities
Route::get('/charities', [CharityController::class, 'index']);
Route::get('/charities/{id}', [CharityController::class, 'show']);
Route::get('/charity/{id}/donations', [DonationController::class, 'getCharityDonations']);
