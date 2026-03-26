<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Role;
use Google\Client as GoogleClient;
use Illuminate\Support\Str;

/**
 * UC12: ตรวจ Google ID Token → upsert Account → คืน Sanctum token
 */
class AuthService
{
    public function loginWithGoogleToken(string $idToken): array
    {
        // ตรวจ token กับ Google
        $client  = new GoogleClient(['client_id' => config('services.google.client_id')]);
        $payload = $client->verifyIdToken($idToken);

        if (! $payload) {
            abort(401, 'Google token ไม่ถูกต้องหรือหมดอายุ');
        }

        $googleId    = $payload['sub'];
        $email       = $payload['email'];
        $displayName = $payload['name']   ?? null;
        $avatarUrl   = $payload['picture'] ?? null;

        // หา role USER (id=1)
        $userRole = Role::where('name', 'USER')->firstOrFail();

        // upsert Account
        $account = Account::firstOrCreate(
            ['google_id' => $googleId],
            [
                'id'               => Str::ulid(),
                'role_id'          => $userRole->id,
                'email'            => $email,
                'display_name'     => $displayName,
                'avatar_url'       => $avatarUrl,
                'is_email_verified'=> true,
                'is_active'        => true,
            ]
        );

        // อัปเดตข้อมูลล่าสุดและ last_login
        $account->update([
            'display_name' => $displayName ?? $account->display_name,
            'avatar_url'   => $avatarUrl   ?? $account->avatar_url,
            'last_login'   => now(),
        ]);

        // สร้าง Sanctum token
        $token = $account->createToken('myorder-app')->plainTextToken;

        return [
            'user'  => [
                'id'       => $account->id,
                'name'     => $account->display_name,
                'email'    => $account->email,
                'avatar'   => $account->avatar_url,
                'role'     => $account->role->name,  // USER | ADMIN
                'has_shop' => $account->shop !== null,
            ],
            'token' => $token,
        ];
    }
}