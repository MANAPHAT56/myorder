<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReportRequest;
use Illuminate\Http\Request;

/**
 * UC2: จัดการคำร้องรายงานร้านค้า
 */
class AdminReportController extends Controller
{
    /** GET /api/v1/admin/reports */
    public function index(Request $request)
    {
        return ReportRequest::with(['shop', 'reporter', 'fraudType', 'attachments'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->integer('per_page', 8));
    }

    /** PATCH /api/v1/admin/reports/{id}/resolve */
    public function resolve(Request $request, int $id)
    {
        $report = ReportRequest::findOrFail($id);
        $report->update(['status' => 'resolved']);

        return response()->json(['message' => 'ดำเนินการคำร้องเรียบร้อย']);
    }
}
