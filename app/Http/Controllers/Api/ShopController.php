<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Services\ShopService;
use Illuminate\Http\Request;

/**
 * UC8:  ค้นหาร้านค้า (ทุก actor)
 * UC13: ดูรายละเอียดร้านค้า (ทุก actor)
 */
class ShopController extends Controller
{
    public function __construct(private ShopService $shopService) {}

    /**
     * ค้นหาและกรองร้านค้า
     * GET /api/v1/shops?q=&category=&tier=&page=&show_closed=
     */
    public function index(Request $request)
    {
        $shops = $this->shopService->search([
            'query'       => $request->q,
            'category'    => $request->category,
            'tier'        => $request->tier,           // all|tier1+|tier2+|tier3|blacklist
            'show_closed' => $request->boolean('show_closed'),
            'page'        => $request->integer('page', 1),
            'per_page'    => $request->integer('per_page', 8),
        ]);

        return ShopResource::collection($shops);
    }

    /**
     * ร้านค้าแนะนำ (tier สูง + rating ดี)
     * GET /api/v1/shops/featured
     */
    public function featured()
    {
        $shops = $this->shopService->getFeatured(10);
        return ShopResource::collection($shops);
    }

    /**
     * ดูรายละเอียดร้านค้า
     * GET /api/v1/shops/{ref_id}
     */
    public function show(string $refId)
    {
        $shop = $this->shopService->findByRefId($refId);
        return new ShopResource($shop);
    }
}