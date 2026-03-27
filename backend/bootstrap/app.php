<?php

/**
 * bootstrap/app.php — แก้ไขไฟล์นี้ในโปรเจกต์ Laravel จริง
 * เพิ่ม middleware aliases และ API prefix
 *
 * สำหรับ Laravel 11 (ไม่มี Kernel.php แล้ว)
 */

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // routes/api.php จัดการ prefix /api/v1 เอง
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ── Sanctum: ให้ใช้ string morphs กับ Account model (ULID PK) ──
        $middleware->alias([
            'is_admin'          => \App\Http\Middleware\IsAdmin::class,
            'ensure_shop_owner' => \App\Http\Middleware\EnsureShopOwner::class,
        ]);

        // ── CORS: อนุญาต frontend domain ──
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // JSON error responses สำหรับ API
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'กรุณาเข้าสู่ระบบก่อน'], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึง'], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'ไม่พบข้อมูลที่ต้องการ'], 404);
            }
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'ข้อมูลไม่ถูกต้อง',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });
    })->create();
