# myOrder Laravel Backend — คู่มือติดตั้งฉบับสมบูรณ์

## ไฟล์ทั้งหมด (43 ไฟล์)

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

app/Http/Middleware/
├── IsAdmin.php
└── EnsureShopOwner.php

app/Http/Requests/
├── StoreShopRequest.php
├── UpdateShopRequest.php
├── SubmitUpgradeRequest.php
├── StoreReportRequest.php
└── StoreClaimRequest.php

app/Http/Resources/
├── ShopResource.php
├── UpgradeRequestResource.php
└── AttachmentResource.php

app/Models/
├── Account.php, Shop.php, Role.php, FraudType.php, Bookbank.php
├── UpgradeRequest.php, ReportRequest.php, ClaimRequest.php
├── Attachment.php, Blacklist.php, UpgradeApprovalLog.php

app/Services/
├── AuthService.php       Google OAuth → Sanctum token
├── ShopService.php       search, filter, paginate
├── UpgradeService.php    cooldown 30 วัน logic
└── FileUploadService.php S3 / local storage

app/Policies/
├── ShopPolicy.php
└── UpgradeRequestPolicy.php

app/Notifications/
├── UpgradeApproved.php
└── UpgradeRejected.php

app/Jobs/
└── ProcessUpgradeApproval.php

routes/api.php            API routes ทั้งหมด (prefix /api/v1)

database/migrations/      13 migrations (ตาม schema ossd14)
database/seeders/
├── DatabaseSeeder.php
├── RoleSeeder.php
├── FraudTypeSeeder.php
└── AdminAccountSeeder.php

bootstrap/app.php         middleware + exception handlers
config/auth.php           ใช้ Account model แทน User
config/cors.php           อนุญาต frontend domain
composer.json
.env.example
```

---

## ขั้นตอนติดตั้ง

```bash
# 1. สร้าง Laravel project ใหม่
composer create-project laravel/laravel myorder-backend
cd myorder-backend

# 2. Copy ไฟล์จาก zip ทับไฟล์เดิม
cp -r myorder-laravel/* myorder-backend/

# 3. ติดตั้ง dependencies
composer require laravel/sanctum google/apiclient

# 4. ตั้งค่า environment
cp .env.example .env
php artisan key:generate
# แก้ไข DB_*, GOOGLE_CLIENT_ID ใน .env

# 5. Migrate + Seed
php artisan migrate
php artisan db:seed
php artisan db:seed --class=AdminAccountSeeder

# 6. Storage link
php artisan storage:link

# 7. Start
php artisan serve
# → http://localhost:8000/api/v1
```

---

## API Endpoints ทั้งหมด

| Method | Path | UC | Auth |
|--------|------|----|------|
| POST | /api/v1/auth/google | UC12 | - |
| POST | /api/v1/auth/logout | - | sanctum |
| GET  | /api/v1/user/profile | UC15 | sanctum |
| GET  | /api/v1/shops | UC8 | - |
| GET  | /api/v1/shops/featured | UC8 | - |
| GET  | /api/v1/shops/{ref_id} | UC13 | - |
| POST | /api/v1/shops/{ref_id}/report | UC14,17 | sanctum |
| POST | /api/v1/shops/{ref_id}/claim | UC18,17 | sanctum |
| GET  | /api/v1/my-shop | UC19 | sanctum+shop |
| PATCH | /api/v1/my-shop | UC1 | sanctum+shop |
| GET  | /api/v1/my-shop/upgrade/check | UC20 | sanctum+shop |
| POST | /api/v1/my-shop/upgrade | UC20,17 | sanctum+shop |
| GET  | /api/v1/admin/shops | UC6 | admin |
| POST | /api/v1/admin/shops | UC3 | admin |
| PATCH | /api/v1/admin/shops/{ref_id} | UC4 | admin |
| DELETE | /api/v1/admin/shops/{ref_id} | UC5 | admin |
| POST | /api/v1/admin/shops/{ref_id}/blacklist | UC7 | admin |
| PATCH | /api/v1/admin/shops/{ref_id}/tier3 | UC9 | admin |
| GET  | /api/v1/admin/upgrade-requests | UC10 | admin |
| PATCH | /api/v1/admin/upgrade-requests/{id}/approve | UC10 | admin |
| PATCH | /api/v1/admin/upgrade-requests/{id}/reject | UC10 | admin |
| GET  | /api/v1/admin/reports | UC2 | admin |
| PATCH | /api/v1/admin/reports/{id}/resolve | UC2 | admin |
| GET  | /api/v1/admin/claims | UC11 | admin |
| PATCH | /api/v1/admin/claims/{id}/resolve | UC11 | admin |

---

## Production Checklist

- [ ] `FILESYSTEM_DISK=s3` + AWS credentials
- [ ] `QUEUE_CONNECTION=redis` + `php artisan queue:work`
- [ ] ตั้งค่า `MAIL_*` จริงสำหรับ Notification
- [ ] `SANCTUM_STATEFUL_DOMAINS` ตรง domain จริง
- [ ] `allowed_origins` ใน `config/cors.php`
- [ ] `php artisan config:cache && php artisan route:cache`
- [ ] HTTPS บน server
