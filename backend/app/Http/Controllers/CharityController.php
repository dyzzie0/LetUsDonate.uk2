<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use App\Models\DomainUser;
use App\Models\CharityStaff;
use Illuminate\Http\Request;

class CharityController extends Controller
{
    public function index()
    {
        return response()->json(Charity::all());
    }

    public function show($id)
    {
        return response()->json(
            Charity::with(['staff', 'donations', 'inventory'])->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        // Validate input
        $request->validate([
            'charity_name'     => 'required|string',
            'charity_address'  => 'required|string',
            'charity_email'    => 'required|email',
            'contact_person'   => 'required|string',

            'staff_username'   => 'required|string',
            'staff_email'      => 'required|email',
            'staff_password'   => 'required|string|min:6',
        ]);

        // 1. Create charity
        $charity = Charity::create([
            'charity_name'    => $request->charity_name,
            'charity_address' => $request->charity_address,
            'charity_email'   => $request->charity_email,
            'contact_person'  => $request->contact_person,
        ]);

        // 2. Create user (charity staff)
        $user = DomainUser::create([
            'user_name'     => $request->staff_username,
            'user_email'    => $request->staff_email,
            'user_password' => password_hash($request->staff_password, PASSWORD_DEFAULT),
            'role_id'       => 11, // charity role
        ]);

        // 3. Link user to charity
        CharityStaff::create([
            'charity_ID' => $charity->charity_ID,
            'user_ID'    => $user->user_ID,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Charity and staff created successfully',
        ]);
    }
}
