<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use App\Models\DomainUser;
use App\Models\CharityStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CharityController extends Controller
{
    // Get all charities
    public function index()
    {
        return response()->json(Charity::all());
    }

    // Get single charity with staff & donations
    public function show($id)
    {
        return response()->json(
            Charity::with(['staff', 'donations', 'inventory'])->findOrFail($id)
        );
    }

    // Create new charity with staff
    public function store(Request $request)
    {
        $request->validate([
            'charity_name'     => 'required|string',
            'charity_address'  => 'required|string',
            'charity_email'    => 'required|email',
            'contact_person'   => 'required|string',
            'staff_username'   => 'required|string',
            'staff_email'      => 'required|email',
            'staff_password'   => 'required|string|min:6',
        ]);

        try {
            // Prevent duplicate emails
            if (DomainUser::where('user_email', $request->staff_email)->exists()) {
                return response()->json(['status' => 'error', 'message' => 'Staff email already exists.'], 409);
            }
            if (Charity::where('charity_email', $request->charity_email)->exists()) {
                return response()->json(['status' => 'error', 'message' => 'Charity email already exists.'], 409);
            }

            $charity = Charity::create([
                'charity_name'    => $request->charity_name,
                'charity_address' => $request->charity_address,
                'charity_email'   => $request->charity_email,
                'contact_person'  => $request->contact_person,
            ]);

            $user = DomainUser::create([
                'user_name'     => $request->staff_username,
                'user_email'    => $request->staff_email,
                'user_password' => password_hash($request->staff_password, PASSWORD_DEFAULT),
                'role_id'       => 11, // charity staff role
            ]);

            CharityStaff::create([
                'charity_ID' => $charity->charity_ID,
                'user_ID'    => $user->user_ID,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Charity and staff created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to create charity: ' . $e->getMessage()], 500);
        }
    }

    // Update existing charity
    public function update(Request $request, $id)
    {
        $request->validate([
            'charity_name'     => 'required|string',
            'charity_address'  => 'required|string',
            'charity_email'    => 'required|email',
            'contact_person'   => 'required|string',
        ]);

        try {
            $charity = Charity::findOrFail($id);

            // Prevent duplicate charity email
            if (Charity::where('charity_email', $request->charity_email)
                ->where('charity_ID', '<>', $id)->exists()) {
                return response()->json(['status' => 'error', 'message' => 'Charity email already exists.'], 409);
            }

            $charity->update([
                'charity_name'    => $request->charity_name,
                'charity_address' => $request->charity_address,
                'charity_email'   => $request->charity_email,
                'contact_person'  => $request->contact_person,
            ]);

            return response()->json(['status' => 'success', 'message' => 'Charity updated successfully', 'charity' => $charity]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to update charity: ' . $e->getMessage()], 500);
        }
    }

    // Delete charity and related staff link
    public function destroy($id)
    {
        try {
            $charity = Charity::findOrFail($id);

            // Remove charity staff links
            CharityStaff::where('charity_ID', $id)->delete();

            $charity->delete();

            return response()->json(['status' => 'success', 'message' => 'Charity deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to delete charity: ' . $e->getMessage()], 500);
        }
    }
    // Get simplified list of charities for dropdowns
    public function getCharitiesList()
    {
        try {
            $charities = DB::table('Charity')
                ->select('charity_ID as id', 'charity_name as name')
                ->orderBy('charity_name')
                ->get();

            return response()->json(['status' => 'success', 'charities' => $charities]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to fetch charities: ' . $e->getMessage()], 500);
        }
    }
}
