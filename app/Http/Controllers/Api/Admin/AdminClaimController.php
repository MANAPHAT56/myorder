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
        $claim = ClaimRequest::findOrFail($id);
        $claim->update(['status' => 'resolved']);

        return response()->json(['message' => 'ปิดคำร้องเคลมเรียบร้อย']);
    }
}