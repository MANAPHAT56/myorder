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
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use Illuminate\Support\Facades\DB;
Route::get('/test-speed', function () {
    // 1. เช็คเวลาที่ Laravel ใช้ในการสตาร์ทตัวเอง (Boot Time)
    $bootTime = microtime(true) - LARAVEL_START;

    // 2. เช็คเวลาที่ใช้ในการ "เปิดการเชื่อมต่อและดึงข้อมูล 1 แถว"
    $dbStart = microtime(true);
    DB::table('shops')->first(); // ลองดึงร้านแรก
    $dbTime = microtime(true) - $dbStart;

    // 3. เวลารวมทั้งหมด
    $totalTime = microtime(true) - LARAVEL_START;

    return response()->json([
        '1_boot_time_seconds' => round($bootTime, 4),
        '2_db_connection_and_query_seconds' => round($dbTime, 4),
        '3_total_time_seconds' => round($totalTime, 4)
    ]);
});
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
Route::get('dashboard', [AdminDashboardController::class, 'index']);
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