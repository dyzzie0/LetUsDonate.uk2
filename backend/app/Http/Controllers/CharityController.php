<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Charity;
use Illuminate\Http\Request;

class CharityController extends Controller
{
    public function index()
    {
        $charities = Charity::all();
        return response()->json($charities);
    }

    public function show($id)
    {
        $charity = Charity::with(['staff', 'donations', 'inventory'])->findOrFail($id);
        return response()->json($charity);
    }
}
