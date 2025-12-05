<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\DomainUser;
use App\Models\Donor;
use App\Models\Role;
use App\Models\CharityStaff;



class AuthController extends Controller
{
    //login
    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    //find user by email
    $user = DomainUser::where('user_email', $request->email)->first();

    if ($user && Hash::check($request->password, $user->user_password)) {

        $userData = $user->toArray();

        //attach donor data if user is a donor
        $donor = Donor::where('user_ID', $user->user_ID)->first();
        if ($donor) {
            $userData['donor'] = $donor; 
        }

        //attach charity staff, charity_ID if charity staff
        if ($user->role_id == 11) {
            $charityStaff = CharityStaff::where('user_ID', $user->user_ID)->first();
            if ($charityStaff) {
                $userData['charity_ID'] = $charityStaff->charity_ID;
            }
        }

        return response()->json([
            'status' => 'success',
            'user' => $userData
        ]);
    }

    return response()->json([
        'status' => 'error',
        'message' => 'Invalid credentials'
    ], 401);
}


    //Sign up
    public function signup(Request $request)
    {
        //validates input
        $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:User,user_email',
            'password' => 'required|string|min:6',
        ]);
    
        //Automatically assigns Donor role just becuase we only allow donors to signup due to security measures 
        $donorRole = \App\Models\Role::firstOrCreate(
            ['role_name' => 'donor'],
            ['role_description' => 'A person who donates clothing or items.']
        );
    
        //Creates the user
        $user = \App\Models\DomainUser::create([
            'user_name' => $request->fullName,
            'user_email' => $request->email,
            'user_password' => Hash::make($request->password),
            'role_id' => $donorRole->role_id,
        ]);
    
        //creates the donor record
        \App\Models\Donor::create([
            'user_ID' => $user->user_ID,
            'donor_address' => null,
        ]);
    
        return response()->json([
            'status' => 'success',
            'user' => $user
        ]);
    }
}
    
