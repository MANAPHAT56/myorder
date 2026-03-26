<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;

/**
 * UC12: เข้าสู่ระบบด้วย Google OAuth
 * UC15: ดูโปรไฟล์ผู้ใช้
 */
class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    /**
     * รับ Google ID Token จาก frontend → verify → คืน Sanctum token
     * POST /api/v1/auth/google
     */
    public function loginWithGoogle(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        $result = $this->authService->loginWithGoogleToken($request->token);

        return response()->json([
            'user'  => $result['user'],
            'token' => $result['token'],
        ]);
    }

    /**
     * ดูโปรไฟล์ตัวเอง
     * GET /api/v1/user/profile
     */
    public function profile(Request $request)
    {
        $account = $request->user()->load('role', 'shop');

        return response()->json([
            'id'       => $account->id,
            'name'     => $account->display_name,
            'email'    => $account->email,
            'avatar'   => $account->avatar_url,
            'role'     => $account->role->name,        // USER / ADMIN
            'has_shop' => $account->shop !== null,
            'shop_ref' => $account->shop?->ref_id,
        ]);
    }

    /**
     * ออกจากระบบ — revoke current token
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ออกจากระบบเรียบร้อย']);
    }
}
