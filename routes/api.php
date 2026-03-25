<?php
Route::post('/auth/google', [AuthController::class, 'loginWithGoogle']);
Route::get('/shops', [ShopController::class, 'index']);        // UC8: ค้นหา
Route::get('/shops/featured', [ShopController::class, 'featured']);
Route::get('/shops/{ref_id}', [ShopController::class, 'show']); // UC13

// ── Authenticated (Sanctum) ───────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/profile', [AuthController::class, 'profile']); // UC15

    // UC1, UC19: ร้านของตัวเอง
    Route::prefix('my-shop')->group(function () {
        Route::get('/',        [MyShopController::class, 'show']);
        Route::patch('/',      [MyShopController::class, 'update']);
        Route::get('/upgrade/check', [UpgradeController::class, 'check']); // UC20
        Route::post('/upgrade',      [UpgradeController::class, 'submit']);
    });

    Route::post('/shops/{ref_id}/report', [ReportController::class, 'store']); // UC14
    Route::post('/shops/{ref_id}/claim',  [ClaimController::class, 'store']);  // UC18
});

// ── Admin only ────────────────────────────────────
Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
    Route::apiResource('shops', AdminShopController::class); // UC3,4,5,6
    Route::post('shops/{ref_id}/blacklist', [AdminShopController::class, 'blacklist']); // UC7
    Route::patch('shops/{ref_id}/tier3',    [AdminShopController::class, 'promoteTier3']); // UC9

    Route::get('upgrade-requests', [AdminUpgradeController::class, 'index']);
    Route::patch('upgrade-requests/{id}/approve', [AdminUpgradeController::class, 'approve']); // UC10
    Route::patch('upgrade-requests/{id}/reject',  [AdminUpgradeController::class, 'reject']);

    Route::get('reports', [AdminReportController::class, 'index']);       // UC2
    Route::patch('reports/{id}/resolve', [AdminReportController::class, 'resolve']);

    Route::get('claims', [AdminClaimController::class, 'index']);         // UC11
    Route::patch('claims/{id}/resolve', [AdminClaimController::class, 'resolve']);
});