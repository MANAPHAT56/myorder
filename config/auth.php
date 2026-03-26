<?php

/**
 * config/auth.php — เปลี่ยน model เป็น Account
 * แทนที่ไฟล์ config/auth.php ในโปรเจกต์จริง
 */

return [

    'defaults' => [
        'guard'     => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'accounts'),
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'accounts',
        ],
        'api' => [
            'driver'   => 'sanctum',
            'provider' => 'accounts',
        ],
    ],

    'providers' => [
        // เปลี่ยนจาก users → accounts
        'accounts' => [
            'driver' => 'eloquent',
            'model'  => env('AUTH_MODEL', App\Models\Account::class),
        ],
    ],

    'passwords' => [
        'accounts' => [
            'provider' => 'accounts',
            'table'    => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),
];
