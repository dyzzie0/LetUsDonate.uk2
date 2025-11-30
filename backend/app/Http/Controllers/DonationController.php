<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\DonationItem;
use App\Models\Inventory;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    /**
     * Get donations for a specific donor
     */
    public function getUserDonations($donorId)
    {
        $donations = Donation::with(['items', 'charity'])
            ->where('donor_ID', $donorId)
            ->orderByDesc('donation_date')
            ->get();

        return response()->json([
            'status' => 'success',
            'donations' => $donations,
        ]);
    }

    /**
     * Create donation + item + update inventory
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'donor_ID'        => ['required', 'integer'],
            'charity_ID'      => ['required', 'integer', 'exists:Charity,charity_ID'],
            'item_name'       => ['required', 'string', 'max:255'],
            'category'        => ['required', 'string', 'max:255'],
            'size'            => ['required', 'string', 'max:10'],
            'condition'       => ['required', 'string'],
            'description'     => ['nullable', 'string'],
            'image'           => ['nullable', 'image', 'max:4096'],
            'pickup_address'  => ['nullable', 'string', 'max:255'],
        ]);

        // -----------------------------------
        //  UPLOAD IMAGE
        // -----------------------------------
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('donation_images', 'public');
        }

        // -----------------------------------
        //  CREATE DONATION
        // -----------------------------------
        $donation = Donation::create([
            'donor_ID'        => $validated['donor_ID'],
            'charity_ID'      => $validated['charity_ID'],
            'donation_status' => 'Pending',
            'donation_date'   => now(),
            'pickup_address'  => $validated['pickup_address'] ?? null,
        ]);

        // -----------------------------------
        //  CREATE DONATION ITEM
        // -----------------------------------
        $item = DonationItem::create([
            'donation_ID'      => $donation->donation_ID,
            'item_name'        => $validated['item_name'],
            'item_category'    => $validated['category'],
            'item_size'        => $validated['size'],
            'item_condition'   => $validated['condition'],
            'item_description' => $validated['description'] ?? null,
            'item_image'       => $imagePath,
        ]);

        // -----------------------------------
        //  UPDATE INVENTORY (correct mapping!)
        // -----------------------------------
        $inventory = Inventory::firstOrCreate(
            [
                'charity_ID' => $validated['charity_ID'],
                'item'       => $item->item_name,
                'category'   => $item->item_category,  // ← Correct
                'size'       => $item->item_size,
            ],
            [
                'quantity' => 0
            ]
        );

        $inventory->increment('quantity');

        // -----------------------------------
        //  RESPONSE
        // -----------------------------------
        return response()->json([
            'status'   => 'success',
            'message'  => 'Donation submitted and inventory updated!',
            'donation' => $donation,
            'item'     => $item,
        ], 201);
    }

    // Get all donations for a charity
    public function getCharityDonations($charityId)
    {
        $donations = Donation::with(['items', 'donor.user'])
            ->where('charity_ID', $charityId)
            ->orderByDesc('donation_date')
            ->get();

        return response()->json([
            'status'    => 'success',
            'donations' => $donations,
        ]);
    }


    // Update donation status (Approved / Declined / Pending)
    public function updateStatus(Request $request, $donationId)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Pending,Approved,Declined'],
        ]);

        $donation = Donation::with('items')->findOrFail($donationId);

        $donation->donation_status = $validated['status'];
        $donation->save();

        // --------------------------
        // ONLY add to inventory if approved
        // --------------------------
        if ($validated['status'] === 'Approved') {

            foreach ($donation->items as $item) {

                \App\Models\Inventory::firstOrCreate(
                    [
                        'charity_ID' => $donation->charity_ID,
                        'item'       => $item->item_name,
                        'category'   => $item->item_category,
                        'size'       => $item->item_size,
                    ],
                    [ 'quantity' => 0 ]
                )->increment('quantity');
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Donation status updated to {$validated['status']}.",
        ]);
    }


    public function getAllDonations()
    {
        $donations = Donation::with(['items', 'charity', 'donor'])
            ->orderByDesc('donation_date')
            ->get();

        return response()->json([
            'status' => 'success',
            'donations' => $donations,
        ]);
    }


}
