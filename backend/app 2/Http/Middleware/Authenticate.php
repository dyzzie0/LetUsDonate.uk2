<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Prevent redirecting API routes to /login
     */
    protected function redirectTo($request)
    {
        if ($request->is('api/*')) { 
            return null; 
        }

        if (! $request->expectsJson()) {
            return route('login');
        }
    }
}
