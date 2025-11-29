<?php

namespace App\Http\Controllers;

use App\Models\DonationItem;
use App\Models\Donation;
use App\Models\Inventory;
use Illuminate\Http\Request;

class DonationItemController extends Controller
{
    public function index()
    {
        $items = DonationItem::with(['donation', 'donation.charity'])->get();
        return response()->json($items);
    }

    public function show($id)
    {
        $item = DonationItem::with(['donation', 'donation.charity'])->findOrFail($id);
        return response()->json($item);
    }

    /**
     * Store a new donation item AND update the charity's inventory
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'donation_ID'    => ['required', 'integer', 'exists:Donation,donation_ID'],
            'item_name'      => ['required', 'string'],
            'item_category'  => ['required', 'string'],
            'item_size'      => ['nullable', 'string'],
            'item_condition' => ['required', 'string'],
            'item_description' => ['nullable', 'string'],
            'item_image'     => ['nullable', 'string'],
        ]);

        // Create the donation item
        $item = DonationItem::create($validated);

        // Get donation so we know which charity owns it
        $donation = Donation::find($validated['donation_ID']);

        // Update/Insert into inventory
        Inventory::updateOrCreate(
            [
                'charity_ID' => $donation->charity_ID,
                'item'       => $validated['item_name'],
                'category'   => $validated['item_category'],
                'size'       => $validated['item_size'] ?? null,
            ],
            [
                'quantity' => \DB::raw('quantity + 1')
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Donation item saved and inventory updated.',
            'item' => $item
        ], 201);
    }
}
