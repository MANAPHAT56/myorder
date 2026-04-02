<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateShopRequest;
use App\Http\Resources\ShopResource;
use Illuminate\Http\Request;

/**
 * UC1:  แก้ไขรายละเอียดร้านค้าของตัวเอง
 * UC19: ดูรายละเอียดร้านในครอบครอง
 *
 * ทุก route ใน group นี้ต้อง auth:sanctum + มีร้าน (EnsureShopOwner middleware)
 */
class MyShopController extends Controller
{
    /**
     * ดูข้อมูลร้านค้าของตัวเอง
     * GET /api/v1/my-shop
     */
    public function show(Request $request)
    {
        $shop = $request->user()->shop()->with([
            'upgradeRequests' => fn($q) => $q->latest()->take(10),
        ])->firstOrFail();

        return new ShopResource($shop);
    }

    /**
     * UC1: แก้ไขชื่อ, ลิงก์, รายละเอียดร้าน
     * PATCH /api/v1/my-shop
     */
   public function update(UpdateShopRequest $request)
{
    $user = $request->user();
    
    // ลองเช็ค Manual ว่า Query เจอไหม
    $shop = \App\Models\Shop::where('owner_account_id', $user->id)->first();
    
    if (!$shop) {
        return response()->json([
            'error' => 'Shop not found',
            'debug_user_id' => $user->id
        ], 404);
    }

    $shop->update($request->validated());
    return new ShopResource($shop->fresh());
}
}
