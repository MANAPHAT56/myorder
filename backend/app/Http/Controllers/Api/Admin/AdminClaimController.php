<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClaimRequest;
use Illuminate\Http\Request;

/**
 * UC11: จัดการคำร้องเคลม
 */
class AdminClaimController extends Controller
{
    /** GET /api/v1/admin/claims */
    public function index(Request $request)
    {
        return ClaimRequest::with(['shop', 'claimer', 'attachments'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->integer('per_page', 8));
    }

    /** PATCH /api/v1/admin/claims/{id}/resolve */
   public function resolve(Request $request, int $id)
{
    $request->validate([
        'resolution'    => 'required|in:REFUNDED,REJECTED,NOTED',
        'refund_amount' => 'nullable|numeric|min:0',
        'admin_note'    => 'nullable|string|max:500',
    ]);

    $claim = ClaimRequest::findOrFail($id);
    $claim->update(['status' => 'resolved']);

    AdminActionLog::create([
        'admin_id'    => $request->user()->id,
        'action_type' => 'RESOLVE_CLAIM',
        'target_type' => 'claim_requests',
        'target_id'   => (string) $claim->id,
        'details'     => [
            'resolution'    => $request->resolution,
            'refund_amount' => $request->refund_amount,
            'admin_note'    => $request->admin_note,
        ],
        'ip_address' => $request->ip(),
        'created_at' => now(),
    ]);

    return response()->json(['message' => 'ปิดคำร้องเคลมเรียบร้อย']);
}
}
