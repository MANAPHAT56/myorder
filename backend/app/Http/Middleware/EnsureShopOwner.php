<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * ตรวจว่า user มีร้านค้าในระบบ
 * ใช้ใน route group /my-shop/*
 */
class EnsureShopOwner
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()?->shop) {
            return response()->json([
                'message' => 'คุณยังไม่มีร้านค้าในระบบ กรุณาติดต่อ myOrder เพื่อลงทะเบียน',
            ], 403);
        }

        return $next($request);
    }
}
