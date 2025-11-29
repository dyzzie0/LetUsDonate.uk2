<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PublicApi
{
    public function handle(Request $request, Closure $next)
    {
        // API routes should NOT redirect
        $request->headers->set('X-No-Redirect', '1');
        return $next($request);
    }
}
