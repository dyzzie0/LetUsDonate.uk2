<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use Illuminate\Http\Request;

class DonorController extends Controller
{
    public function index()
    {
        $donors = Donor::with(['user', 'donations'])->get();
        return response()->json($donors);
    }

    public function show($id)
    {
        $donor = Donor::with(['user', 'donations'])->findOrFail($id);
        return response()->json($donor);
    }
}
