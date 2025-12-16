<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Charity;
use App\Models\DomainUser;
use Illuminate\Http\Request;

// Admin controller for managing donations, charities, users, and dashboard stats
class AdminController extends Controller
{
    // Getting all donations (with their items + charity + donor)

    public function getAllDonations()
    {
        $donations = Donation::with(['items', 'charity', 'donor'])
            ->orderBy('donation_date', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'donations' => $donations
        ]);
    }

    // Getting all charities
    public function getAllCharities()
    {
        $charities = Charity::all();
        return response()->json([
            'status' => 'success',
            'charities' => $charities
        ]);
    }

    // Get all users 
    public function getAllUsers()
    {
        try{
            //fetch all users  
        $users = DomainUser::all();
        return response()->json([
        'status' => 'success',
        'users' => $users
        ]);

        }catch(\Exception $e) {
            return response()->json([
                'error'=> $e->getMessage()
            ], 500);
            
        }
    }

    // Metrics for all the charts
    public function getDashboardStats()
    {
        $donations = Donation::with(['items', 'charity'])->get();

        // Total donations
        $total = $donations->count();

        // CO2 saved = donations * 1.5
        $co2 = round($total * 1.5, 1);

        // Active charities count
        $activeCharities = $donations->groupBy('charity_ID')->count();

        // Format donation labels
        $donation_labels = $donations->take(10)->pluck('donation_date');

        return response()->json([
            'status' => 'success',
            'stats' => [
                'totalDonations'     => $total,
                'totalCO2Saved'      => $co2,
                'activeCharities'    => $activeCharities,
                'donationDates'      => $donation_labels,
            ],
            'donations' => $donations
        ]);
    }
}
