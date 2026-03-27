<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Models\Shop;
use App\Models\ReportRequest;
use App\Models\Attachment;
use App\Services\FileUploadService;

/**
 * UC14: รายงานร้านค้า (ต้อง login)
 * UC17: แนบหลักฐาน
 */
class ReportController extends Controller
{
    public function __construct(private FileUploadService $fileService) {}

    /**
     * POST /api/v1/shops/{ref_id}/report
     */
    public function store(StoreReportRequest $request, string $refId)
    {
        $shop = Shop::where('ref_id', $refId)
            ->where('is_deleted', false)
            ->firstOrFail();

        $report = ReportRequest::create([
            'reporter_account_id'  => $request->user()->id,
            'reported_shop_ref_id' => $shop->ref_id,
            'fraud_type_id'        => $request->fraud_type_id,
            'reason'               => $request->reason,
            'status'               => 'pending',
        ]);

        // UC17: เอกสารแนบ
        foreach ($request->file('attachments', []) as $idx => $file) {
            $url = $this->fileService->uploadReport($file, $report->id);
            Attachment::create([
                'report_request_id' => $report->id,
                'file_url'          => $url,
            ]);
        }

        return response()->json(['message' => 'ส่งรายงานเรียบร้อยแล้ว'], 201);
    }
}
