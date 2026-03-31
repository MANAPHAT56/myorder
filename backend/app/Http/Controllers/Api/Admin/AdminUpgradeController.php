<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UpgradeRequestResource;
use App\Models\UpgradeRequest;
use App\Models\AdminActionLog;
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
        $request->validate([
            'admin_remark' => 'nullable|string|max:500',
        ]);

        $upgradeReq = UpgradeRequest::where('status', 'pending')->findOrFail($id);
        $shop       = $upgradeReq->shop;

        $upgradeReq->update(['status' => 'approved']);

        $shop->update([
            'current_tier'         => 'TIER_2',
            'failed_upgrade_count' => 0,
        ]);

        AdminActionLog::create([
            'admin_id'    => $request->user()->id,
            'action_type' => 'APPROVE_TIER',
            'target_type' => 'upgrade_requests',
            'target_id'   => (string) $upgradeReq->id,
            'details'     => [
                'shop_ref_id'  => $shop->ref_id,
                'old_tier'     => 'TIER_1',
                'new_tier'     => 'TIER_2',
                'admin_remark' => $request->admin_remark,
            ],
            'ip_address' => $request->ip(),
            'created_at' => now(),
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

        $shop->increment('failed_upgrade_count');

        AdminActionLog::create([
            'admin_id'    => $request->user()->id,
            'action_type' => 'REJECT_TIER',
            'target_type' => 'upgrade_requests',
            'target_id'   => (string) $upgradeReq->id,
            'details'     => [
                'shop_ref_id' => $shop->ref_id,
                'reason'      => $request->reason,
            ],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => "ปฏิเสธคำขอของ \"{$shop->name}\""]);
    }
}