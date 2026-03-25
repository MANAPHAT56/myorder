<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UpgradeRequestResource;
use App\Models\UpgradeRequest;
use App\Models\UpgradeApprovalLog;
use Illuminate\Http\Request;

/**
 * UC10: ตรวจสอบและอนุมัติ/ปฏิเสธคำขอเลื่อนขั้น 1→2
 */
class AdminUpgradeController extends Controller
{
    /** GET /api/v1/admin/upgrade-requests?status=pending */
    public function index(Request $request)
    {
        $requests = UpgradeRequest::with(['shop', 'attachments'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->integer('per_page', 8));

        return UpgradeRequestResource::collection($requests);
    }

    /**
     * UC10: อนุมัติ
     * PATCH /api/v1/admin/upgrade-requests/{id}/approve
     */
    public function approve(Request $request, int $id)
    {
        $upgradeReq = UpgradeRequest::where('status', 'pending')->findOrFail($id);
        $shop       = $upgradeReq->shop;

        $upgradeReq->update(['status' => 'approved']);
        $shop->update([
            'shop_status'         => 'TIER2',
            'failed_upgrade_count' => 0,
        ]);

        UpgradeApprovalLog::create([
            'upgrade_request_id' => $upgradeReq->id,
            'shop_ref_id'        => $shop->ref_id,
            'admin_account_id'   => $request->user()->id,
            'action'             => 'approved',
        ]);

        return response()->json(['message' => "อนุมัติคำขอของ \"{$shop->name}\" แล้ว"]);
    }

    /**
     * UC10: ปฏิเสธ
     * PATCH /api/v1/admin/upgrade-requests/{id}/reject
     */
    public function reject(Request $request, int $id)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $upgradeReq = UpgradeRequest::where('status', 'pending')->findOrFail($id);
        $shop       = $upgradeReq->shop;

        $upgradeReq->update([
            'status'       => 'rejected',
            'admin_remark' => $request->reason,
        ]);

        // เพิ่ม failed_count และบันทึกวันที่ reject ล่าสุด
        $shop->increment('failed_upgrade_count');

        UpgradeApprovalLog::create([
            'upgrade_request_id' => $upgradeReq->id,
            'shop_ref_id'        => $shop->ref_id,
            'admin_account_id'   => $request->user()->id,
            'action'             => 'rejected',
            'reason'             => $request->reason,
        ]);

        return response()->json(['message' => "ปฏิเสธคำขอของ \"{$shop->name}\""]);
    }
}