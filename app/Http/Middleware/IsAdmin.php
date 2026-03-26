<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * ตรวจว่า user มี role ADMIN
 * ใช้ใน routes/api.php → middleware('is_admin')
 */
class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || $request->user()->role->name !== 'ADMIN') {
            return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึง'], 403);
        }

        return $next($request);
    }
}
