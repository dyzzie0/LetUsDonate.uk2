<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\DomainUser;
use App\Models\Donor;
use App\Models\Role;
use App\Models\CharityStaff;

class AuthController extends Controller
{
    /**
     * LOGIN
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Find user by email
        $user = DomainUser::where('user_email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->user_password)) {

            $userData = $user->toArray();

            // Attach donor data
            $donor = Donor::where('user_ID', $user->user_ID)->first();
            if ($donor) {
                $userData['donor'] = $donor;
            }

            // Attach charity staff data
            if ($user->role_id == 11) {
                $charityStaff = CharityStaff::where('user_ID', $user->user_ID)->first();
                if ($charityStaff) {
                    $userData['charity_ID'] = $charityStaff->charity_ID;
                }
            }

            return response()->json([
                'status' => 'success',
                'user'   => $userData,
            ]);
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Invalid credentials',
        ], 401);
    }

    /**
     * SIGN UP (OLD VERSION)
     */
    public function signup(Request $request)
    {
        $request->validate([
            'fullName' => 'required|string|max:255',
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        // 🔴 OLD BEHAVIOUR: manual duplicate check
        if (DomainUser::where('user_email', $request->email)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'An account with this email already exists.',
            ], 409);
        }

        // Get donor role
        $donorRole = Role::where('role_name', 'donor')->first();

        // Create user
        $user = DomainUser::create([
            'user_name'     => $request->fullName,
            'user_email'    => $request->email,
            'user_password' => Hash::make($request->password),
            'role_id'       => $donorRole->role_id,
        ]);

        // Create donor record
        Donor::create([
            'user_ID' => $user->user_ID,
            'donor_address' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'user'   => $user,
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
