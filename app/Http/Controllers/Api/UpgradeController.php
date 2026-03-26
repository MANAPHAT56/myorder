<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitUpgradeRequest;
use App\Services\UpgradeService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;

/**
 * UC20: ยื่นขอเลื่อนขั้น 1→2 (เฉพาะเจ้าของร้าน)
 * UC17: ยื่นเอกสารประกอบ
 */
class UpgradeController extends Controller
{
    public function __construct(
        private UpgradeService    $upgradeService,
        private FileUploadService $fileService,
    ) {}

    /**
     * ตรวจสอบสิทธิ์ก่อนยื่น (failed_count + cooldown 30 วัน)
     * GET /api/v1/my-shop/upgrade/check
     */
    public function check(Request $request)
    {
        $shop   = $request->user()->shop;
        $result = $this->upgradeService->checkEligibility($shop);

        return response()->json($result);
        // {
        //   eligible: bool,
        //   failed_count: int,
        //   days_remaining: int,
        //   was_reset: bool
        // }
    }

    /**
     * UC17+UC20: ยื่นคำขอพร้อมเอกสาร
     * POST /api/v1/my-shop/upgrade
     * body: multipart/form-data (files[])
     */
    public function submit(SubmitUpgradeRequest $request)
    {
        $shop = $request->user()->shop;

        // ตรวจสิทธิ์อีกครั้งฝั่ง server
        $eligibility = $this->upgradeService->checkEligibility($shop);
        if (! $eligibility['eligible']) {
            return response()->json([
                'message' => 'ไม่สามารถยื่นขอได้ในขณะนี้',
                ...$eligibility,
            ], 422);
        }

        // อัปโหลดเอกสาร → เก็บ URL
        $uploadedFiles = [];
        foreach ($request->file('files', []) as $key => $file) {
            $uploadedFiles[] = [
                'label'    => $request->input("labels.{$key}"),
                'file_url' => $this->fileService->uploadKyc($file, $shop->ref_id),
            ];
        }

        $upgradeRequest = $this->upgradeService->submit($shop, $uploadedFiles);

        return response()->json([
            'message'    => 'ส่งคำขอเรียบร้อยแล้ว รอแอดมินตรวจสอบ',
            'request_id' => $upgradeRequest->id,
        ], 201);
    }
}
