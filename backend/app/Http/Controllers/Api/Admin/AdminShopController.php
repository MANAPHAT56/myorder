<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShopRequest;
use App\Http\Requests\UpdateShopRequest;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use App\Models\Blacklist;
use App\Services\ShopService;
use Illuminate\Http\Request;

/**
 * UC3:  เพิ่มร้านค้าใหม่
 * UC4:  แก้ไขข้อมูลร้านค้า
 * UC5:  ลบร้านค้า (soft delete)
 * UC6:  ดูรายการร้านค้าทั้งหมด
 * UC7:  เพิ่ม Blacklist
 * UC9:  เลื่อนขั้น 3 (admin-only)
 */
class AdminShopController extends Controller
{
    public function __construct(private ShopService $shopService) {}

    /** UC6: GET /api/v1/admin/shops */
    public function index(Request $request)
    {
        $shops = $this->shopService->adminList([
            'query'         => $request->q,
            'tier'          => $request->tier,
            'blacklisted'   => $request->boolean('blacklisted'),
            'deleted'       => $request->boolean('deleted'),
            'per_page'      => $request->integer('per_page', 8),
        ]);
        return ShopResource::collection($shops);
    }

    /** UC3: POST /api/v1/admin/shops */
    public function store(StoreShopRequest $request)
    {
        $shop = Shop::create($request->validated());
        return new ShopResource($shop);
    }

    /** GET /api/v1/admin/shops/{ref_id} */
    public function show(string $refId)
    {
        $shop = Shop::where('ref_id', $refId)->firstOrFail();
        return new ShopResource($shop);
    }

    /** UC4: PATCH /api/v1/admin/shops/{ref_id} */
    public function update(UpdateShopRequest $request, string $refId)
    {
        $shop = Shop::where('ref_id', $refId)->firstOrFail();
        $shop->update($request->validated());
        return new ShopResource($shop->fresh());
    }

    /** UC5: DELETE /api/v1/admin/shops/{ref_id} */
    public function destroy(Request $request, string $refId)
{
    $request->validate(['reason' => 'nullable|string|max:255']);

    $shop = Shop::where('ref_id', $refId)->firstOrFail();
    $shop->delete(); // SoftDeletes trait

    AdminActionLog::create([
        'admin_id'    => $request->user()->id,
        'action_type' => 'DELETE_SHOP',
        'target_type' => 'shops',
        'target_id'   => $shop->ref_id,
        'details'     => ['shop_name' => $shop->name, 'reason' => $request->reason],
        'ip_address'  => $request->ip(),
        'created_at'  => now(),
    ]);

    return response()->json(['message' => 'ลบร้านค้าเรียบร้อยแล้ว']);
}

    /**
     * UC7: เพิ่ม Blacklist
     * POST /api/v1/admin/shops/{ref_id}/blacklist
     */
   public function blacklist(Request $request, string $refId)
{
    $request->validate([
        'reason'           => 'required|string|max:500',
        'claim_request_id' => 'nullable|exists:claim_requests,id',
    ]);

    $shop = Shop::where('ref_id', $refId)->firstOrFail();
    $shop->update(['is_blacklist' => true]);

    Blacklist::create([
        'shop_ref_id'      => $shop->ref_id,
        'admin_account_id' => $request->user()->id,
        'claim_request_id' => $request->claim_request_id,
        'reason'           => $request->reason,
    ]);

    AdminActionLog::create([
        'admin_id'    => $request->user()->id,
        'action_type' => 'ADD_BLACKLIST',
        'target_type' => 'shops',
        'target_id'   => $shop->ref_id,
        'details'     => ['claim_request_id' => $request->claim_request_id, 'reason' => $request->reason],
        'ip_address'  => $request->ip(),
        'created_at'  => now(),
    ]);

    return response()->json(['message' => "เพิ่ม \"{$shop->name}\" ใน Blacklist แล้ว"]);
}

    /**
     * UC9: เลื่อนขั้น 3 (admin ทดลองสั่งของแล้ว)
     * PATCH /api/v1/admin/shops/{ref_id}/tier3
     */
    public function promoteTier3(Request $request, string $refId)
    {
        $shop = Shop::where('ref_id', $refId)
    ->where('current_tier', 'TIER_2') // ← ชื่อจริงใน schema
    ->firstOrFail();
$shop->update(['current_tier' => 'TIER_3']);
        return response()->json(['message' => "เลื่อน \"{$shop->name}\" เป็นขั้น 3 เรียบร้อย"]);
    }
}
