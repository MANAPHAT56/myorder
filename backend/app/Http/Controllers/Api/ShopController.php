<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Http\Resources\UpgradeRequestResource;
use App\Models\Shop;
use App\Models\UpgradeRequest;
use App\Services\ShopService;
use Illuminate\Http\Request;

/**
 * UC8:  ค้นหาร้านค้า (ทุก actor)
 * UC13: ดูรายละเอียดร้านค้า (ทุก actor)
 * + endpoint ดู upgrade_requests ของร้าน (ใช้ใน UpgradeCooldownBanner)
 */
class ShopController extends Controller
{
    public function __construct(private ShopService $shopService) {}

    /**
     * GET /api/v1/shops?q=&category=&tier=&page=&show_closed=
     */
    public function index(Request $request)
    {
        $shops = $this->shopService->search([
            'query'       => $request->q,
            'category'    => $request->category,
            'tier'        => $request->tier,
            'show_closed' => $request->boolean('show_closed'),
            'page'        => $request->integer('page', 1),
            'per_page'    => $request->integer('per_page', 8),
        ]);

        return ShopResource::collection($shops);
    }

    /**
     * GET /api/v1/shops/featured
     */
    public function featured()
    {
        $shops = $this->shopService->getFeatured(10);
        return ShopResource::collection($shops);
    }

    /**
     * GET /api/v1/shops/{ref_id}
     */
    public function show(string $refId)
    {
        $shop = $this->shopService->findByRefId($refId);
        return new ShopResource($shop);
    }

    /**
     * GET /api/v1/shops/{ref_id}/upgrade-requests
     *
     * ใช้ใน UpgradeCooldownBanner — ดึง upgrade requests ทั้งหมดของร้าน
     * เรียงจากใหม่ไปเก่า เพื่อหา rejected ล่าสุดสำหรับคำนวณ cooldown 90 วัน
     *
     * Public endpoint — ไม่ต้อง auth เพราะแค่ดูสถานะ (ไม่มีข้อมูลส่วนตัว)
     */
    public function upgradeRequests(string $refId)
    {
        $shop = Shop::where('ref_id', $refId)
            ->whereNull('deleted_at')
            ->firstOrFail();

        $requests = UpgradeRequest::where('shop_ref_id', $shop->ref_id)
            ->orderByDesc('updated_at')
            ->get(['id', 'shop_ref_id', 'status', 'admin_remark', 'created_at', 'updated_at']);

        return UpgradeRequestResource::collection($requests);
    }
}
