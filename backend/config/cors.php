<?php

/**
 * config/cors.php
 * อนุญาต React frontend เรียก API
 * ปรับ allowed_origins ให้ตรงกับ domain จริง
 */

return [
    'paths'                    => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => [
        'http://localhost:5173',   // Vite dev server
        'http://localhost:3000',
        env('FRONTEND_URL', 'https://your-frontend-domain.com'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 0,
    'supports_credentials'     => true,  // ต้องการสำหรับ Sanctum SPA
];
