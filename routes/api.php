<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\MyShopController;
use App\Http\Controllers\Api\UpgradeController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\Admin\AdminShopController;
use App\Http\Controllers\Api\Admin\AdminUpgradeController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminClaimController;

/*
|--------------------------------------------------------------------------
| API Routes — prefix /api/v1  (ตั้งค่าใน RouteServiceProvider)
|--------------------------------------------------------------------------
*/

// ── Public (ไม่ต้อง login) ───────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // UC12: Google OAuth
    Route::post('auth/google',  [AuthController::class, 'loginWithGoogle']);

    // UC8: ค้นหาร้านค้า + featured
    Route::get('shops',          [ShopController::class, 'index']);
    Route::get('shops/featured', [ShopController::class, 'featured']);

    // UC13: ดูรายละเอียดร้านค้า
    Route::get('shops/{ref_id}', [ShopController::class, 'show']);

    // ── Authenticated ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // UC15: โปรไฟล์ + logout
        Route::get ('user/profile',  [AuthController::class, 'profile']);
        Route::post('auth/logout',   [AuthController::class, 'logout']);

        // UC14: รายงานร้านค้า (+ UC17: แนบไฟล์)
        Route::post('shops/{ref_id}/report', [ReportController::class, 'store']);

        // UC18: ยื่นเคลม (+ UC17: แนบไฟล์)
        Route::post('shops/{ref_id}/claim',  [ClaimController::class, 'store']);

        // UC1, UC19: จัดการร้านค้าของตัวเอง
        // middleware EnsureShopOwner ตรวจว่า user มีร้านแล้ว
        Route::prefix('my-shop')
            ->middleware('ensure_shop_owner')
            ->group(function () {
                Route::get  ('/',               [MyShopController::class, 'show']);
                Route::patch('/',               [MyShopController::class, 'update']);

                // UC20: ตรวจสิทธิ์ + ยื่นขอเลื่อนขั้น (+ UC17: เอกสาร)
                Route::get ('upgrade/check',    [UpgradeController::class, 'check']);
                Route::post('upgrade',          [UpgradeController::class, 'submit']);
            });

        // ── Admin only ─────────────────────────────────────────────────────
        Route::prefix('admin')
            ->middleware('is_admin')
            ->group(function () {

                // UC3,4,5,6: CRUD ร้านค้า
                Route::apiResource('shops', AdminShopController::class)
                    ->parameters(['shops' => 'ref_id']);

                // UC7: เพิ่ม Blacklist
                Route::post('shops/{ref_id}/blacklist', [AdminShopController::class, 'blacklist']);

                // UC9: เลื่อนขั้น 3
                Route::patch('shops/{ref_id}/tier3',    [AdminShopController::class, 'promoteTier3']);

                // UC10: คำร้องขอเลื่อนขั้น
                Route::get  ('upgrade-requests',                    [AdminUpgradeController::class, 'index']);
                Route::patch('upgrade-requests/{id}/approve',       [AdminUpgradeController::class, 'approve']);
                Route::patch('upgrade-requests/{id}/reject',        [AdminUpgradeController::class, 'reject']);

                // UC2: คำร้องรายงาน
                Route::get  ('reports',                             [AdminReportController::class, 'index']);
                Route::patch('reports/{id}/resolve',                [AdminReportController::class, 'resolve']);

                // UC11: คำร้องเคลม
                Route::get  ('claims',                              [AdminClaimController::class, 'index']);
                Route::patch('claims/{id}/resolve',                 [AdminClaimController::class, 'resolve']);
            });
    });
});