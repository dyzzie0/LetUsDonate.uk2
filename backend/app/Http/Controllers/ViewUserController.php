<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ViewUserController extends Controller
{
    public function getViewUsers()
    {
        try {
            $users = DB::table('User')
                ->leftJoin('Role', 'User.role_id', '=', 'Role.role_id')
                ->select(
                    'User.user_ID',
                    'User.user_name',
                    'User.user_email',
                    'Role.role_name'
                )
                ->get();

            return response()->json([
                'status' => 'success',
                'users' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}
