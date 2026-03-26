# myOrder Laravel Backend

Backend API สำหรับระบบ myOrder — ครอบคลุม UC1–UC20

## Requirements
- PHP >= 8.2
- Laravel 11
- MySQL 8.0+
- Composer

## Quick Setup

```bash
# 1. ติดตั้ง dependency
composer require laravel/sanctum google/apiclient

# 2. copy ไฟล์เหล่านี้เข้าโปรเจกต์ Laravel ใหม่

# 3. ตั้งค่า .env
DB_CONNECTION=mysql
DB_DATABASE=ossd14
DB_USERNAME=root
DB_PASSWORD=your_password

FILESYSTEM_DISK=local          # เปลี่ยนเป็น s3 สำหรับ production

GOOGLE_CLIENT_ID=your_google_client_id

# 4. Register middleware ใน bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'is_admin'           => \App\Http\Middleware\IsAdmin::class,
        'ensure_shop_owner'  => \App\Http\Middleware\EnsureShopOwner::class,
    ]);
})

# 5. ตั้งค่า Sanctum ให้รองรับ string PK ใน config/auth.php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model'  => App\Models\Account::class,
    ],
],

# 6. Run migrations + seeders
php artisan migrate
php artisan db:seed

# 7. ตั้ง prefix /api/v1 ใน bootstrap/app.php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api',   // routes/api.php จัดการ v1 prefix เอง
)

# 8. Start server
php artisan serve
```

## API Endpoints สรุป

| Method | Endpoint | UC | Auth |
|--------|----------|-----|------|
| POST | /api/v1/auth/google | UC12 | - |
| GET  | /api/v1/user/profile | UC15 | sanctum |
| POST | /api/v1/auth/logout | - | sanctum |
| GET  | /api/v1/shops | UC8 | - |
| GET  | /api/v1/shops/featured | UC8 | - |
| GET  | /api/v1/shops/{ref_id} | UC13 | - |
| POST | /api/v1/shops/{ref_id}/report | UC14,17 | sanctum |
| POST | /api/v1/shops/{ref_id}/claim | UC18,17 | sanctum |
| GET  | /api/v1/my-shop | UC19 | sanctum+shop |
| PATCH| /api/v1/my-shop | UC1 | sanctum+shop |
| GET  | /api/v1/my-shop/upgrade/check | UC20 | sanctum+shop |
| POST | /api/v1/my-shop/upgrade | UC20,17 | sanctum+shop |
| GET  | /api/v1/admin/shops | UC6 | admin |
| POST | /api/v1/admin/shops | UC3 | admin |
| PATCH| /api/v1/admin/shops/{ref_id} | UC4 | admin |
| DELETE| /api/v1/admin/shops/{ref_id} | UC5 | admin |
| POST | /api/v1/admin/shops/{ref_id}/blacklist | UC7 | admin |
| PATCH| /api/v1/admin/shops/{ref_id}/tier3 | UC9 | admin |
| GET  | /api/v1/admin/upgrade-requests | UC10 | admin |
| PATCH| /api/v1/admin/upgrade-requests/{id}/approve | UC10 | admin |
| PATCH| /api/v1/admin/upgrade-requests/{id}/reject | UC10 | admin |
| GET  | /api/v1/admin/reports | UC2 | admin |
| PATCH| /api/v1/admin/reports/{id}/resolve | UC2 | admin |
| GET  | /api/v1/admin/claims | UC11 | admin |
| PATCH| /api/v1/admin/claims/{id}/resolve | UC11 | admin |

## โครงสร้างไฟล์

```
app/Http/Controllers/Api/
├── AuthController.php          UC12, UC15
├── ShopController.php          UC8, UC13
├── MyShopController.php        UC1, UC19
├── UpgradeController.php       UC20, UC17
├── ReportController.php        UC14, UC17
├── ClaimController.php         UC18, UC17
└── Admin/
    ├── AdminShopController.php     UC3,4,5,6,7,9
    ├── AdminUpgradeController.php  UC10
    ├── AdminReportController.php   UC2
    └── AdminClaimController.php    UC11

app/Services/
├── AuthService.php       Google OAuth → Sanctum token
├── ShopService.php       search, filter, paginate
├── UpgradeService.php    cooldown 30 วัน + submit
└── FileUploadService.php S3 / local storage

app/Models/               ตรงกับ schema ossd14 ทุกตาราง
app/Policies/             ShopPolicy, UpgradeRequestPolicy
app/Http/Middleware/      IsAdmin, EnsureShopOwner
app/Http/Requests/        Validation ทุก endpoint
app/Http/Resources/       JSON transform (ShopResource, etc.)
app/Jobs/                 ProcessUpgradeApproval
database/migrations/      12 migrations ตาม schema
database/seeders/         RoleSeeder, FraudTypeSeeder
```
