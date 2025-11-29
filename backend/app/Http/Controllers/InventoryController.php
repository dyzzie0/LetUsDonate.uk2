<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;


class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::with('charity');

        // If charity_ID exists, filter by it
        if ($request->has('charity_ID')) {
            $query->where('charity_ID', $request->charity_ID);
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $item = Inventory::with('charity')->findOrFail($id);
        return response()->json($item);
    }
}
