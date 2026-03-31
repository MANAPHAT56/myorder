<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\MyShopController;
use App\Http\Controllers\Api\UpgradeController;
use App\Http\Controllers\Api\ClaimController;          // ลบ ReportController ออก
use App\Http\Controllers\Api\Admin\AdminShopController;
use App\Http\Controllers\Api\Admin\AdminUpgradeController;
use App\Http\Controllers\Api\Admin\AdminClaimController; // ลบ AdminReportController ออก

Route::prefix('v1')->group(function () {

    // ── Public ───────────────────────────────────────────────────────────
    Route::post('auth/google', [AuthController::class, 'loginWithGoogle']);

    Route::get('shops',          [ShopController::class, 'index']);
    Route::get('shops/featured', [ShopController::class, 'featured']);
    Route::get('shops/{ref_id}', [ShopController::class, 'show']);

    // UC: ดู upgrade requests ของร้าน (ใช้ใน cooldown banner) — public
    Route::get('shops/{ref_id}/upgrade-requests', [ShopController::class, 'upgradeRequests']);

    // ── Authenticated ─────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        Route::get ('user/profile', [AuthController::class, 'profile']);
        Route::post('auth/logout',  [AuthController::class, 'logout']);

        // UC18: ยื่นเคลม (รวม report เข้ามาแล้ว)
        Route::post('shops/{ref_id}/claim', [ClaimController::class, 'store']);

        Route::prefix('my-shop')
            ->middleware('ensure_shop_owner')
            ->group(function () {
                Route::get  ('/',            [MyShopController::class, 'show']);
                Route::patch('/',            [MyShopController::class, 'update']);
                Route::get ('upgrade/check', [UpgradeController::class, 'check']);
                Route::post('upgrade',       [UpgradeController::class, 'submit']);
            });

        // ── Admin only ────────────────────────────────────────────────────
        Route::prefix('admin')
            ->middleware('is_admin')
            ->group(function () {

                Route::apiResource('shops', AdminShopController::class)
                    ->parameters(['shops' => 'ref_id']);

                Route::post ('shops/{ref_id}/blacklist', [AdminShopController::class, 'blacklist']);
                Route::patch('shops/{ref_id}/tier3',     [AdminShopController::class, 'promoteTier3']);

                Route::get  ('upgrade-requests',              [AdminUpgradeController::class, 'index']);
                Route::patch('upgrade-requests/{id}/approve', [AdminUpgradeController::class, 'approve']);
                Route::patch('upgrade-requests/{id}/reject',  [AdminUpgradeController::class, 'reject']);

                // UC11: เคลม (รวม report เข้ามาแล้ว ลบ /reports ออก)
                Route::get  ('claims',            [AdminClaimController::class, 'index']);
                Route::patch('claims/{id}/resolve', [AdminClaimController::class, 'resolve']);
            });
    });
});