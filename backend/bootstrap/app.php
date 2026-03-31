<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web: __DIR__.'/../routes/web.php',  // 👈 🔴 คอมเมนต์หรือลบบรรทัดนี้ทิ้งไปเลยครับ
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // เพิ่ม CORS middleware ตรงนี้ (ใช้ prepend แบบที่คุณเขียนมาก็เวิร์คครับ!)
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        // 👇 เพิ่มบรรทัดนี้ลงไป เพื่อบอกให้ Laravel รู้จักชื่อ 'ensure_shop_owner'
        $middleware->alias([
            'ensure_shop_owner' => \App\Http\Middleware\EnsureShopOwner::class,
               'is_admin' => \App\Http\Middleware\IsAdmin::class, 
        ]);
        
        // 💡 คำแนะนำเพิ่มเติม: ถ้าใช้ React คู่กับระบบ Login ของ Sanctum
        // แนะนำให้ใส่ $middleware->statefulApi(); เพิ่มเข้าไปด้วยนะครับ
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();