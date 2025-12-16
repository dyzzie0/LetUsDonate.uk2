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

            // Attach donor data if donor
            $donor = Donor::where('user_ID', $user->user_ID)->first();
            if ($donor) {
                $userData['donor'] = $donor;
            }

            // Attach charity staff data if role is charity staff
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
     * SIGN UP
     */
    public function signup(Request $request)
    {
        // Validate input
        $request->validate(
            [
                'fullName' => 'required|string|max:255',
                'email'    => 'required|email|unique:DomainUser,user_email',
                'password' => 'required|string|min:6',
            ],
            [
                'email.unique' => 'An account with this email already exists.',
            ]
        );

        // Get donor role (or create if missing)
        $donorRole = Role::firstOrCreate(
            ['role_name' => 'donor'],
            ['role_description' => 'A person who donates clothing or items.']
        );

        // Create user
        $user = DomainUser::create([
            'user_name'     => $request->fullName,
            'user_email'    => $request->email,
            'user_password' => Hash::make($request->password),
            'role_id'       => $donorRole->role_id,
        ]);

        // Create donor record
        Donor::create([
            'user_ID'        => $user->user_ID,
            'donor_address'  => null,
        ]);

        return response()->json([
            'status' => 'success',
            'user'   => $user,
        ]);
    }

    /**
     * LOGOUT (optional placeholder)
     */
    public function logout()
    {
        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
