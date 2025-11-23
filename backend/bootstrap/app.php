<?php

// use App\Http\Middleware\HandleAppearance; // Ensure this class exists or remove its usage
// use App\Http\Middleware\HandleInertiaRequests; // Ensure this class exists or remove its usage
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',      // <-- Add API routes
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Middleware for web routes
        $middleware->web(append: [
            // HandleAppearance::class, // Ensure this class exists or remove its usage
            // HandleInertiaRequests::class, // Ensure this class exists or remove its usage
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Middleware for API routes
        $middleware->api(append: [
            HandleCors::class, // CORS middleware for API routes
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
