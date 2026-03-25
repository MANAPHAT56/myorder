<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClaimRequest;
use App\Models\Shop;
use App\Models\ClaimRequest;
use App\Models\Attachment;
use App\Services\FileUploadService;

/**
 * UC18: ยื่นเรื่องเคลม (ต้อง login)
 * UC17: แนบหลักฐาน
 */
class ClaimController extends Controller
{
    public function __construct(private FileUploadService $fileService) {}

    /**
     * POST /api/v1/shops/{ref_id}/claim
     */
    public function store(StoreClaimRequest $request, string $refId)
    {
        $shop = Shop::where('ref_id', $refId)
            ->where('is_deleted', false)
            ->firstOrFail();

        $claim = ClaimRequest::create([
            'claimer_account_id' => $request->user()->id,
            'shop_ref_id'        => $shop->ref_id,
            'contact_info'       => $request->contact_info,
            'status'             => 'pending',
        ]);

        // UC17: หลักฐาน
        foreach ($request->file('attachments', []) as $file) {
            $url = $this->fileService->uploadClaim($file, $claim->id);
            Attachment::create([
                'claim_request_id' => $claim->id,
                'file_url'         => $url,
            ]);
        }

        return response()->json(['message' => 'ส่งเรื่องเคลมเรียบร้อยแล้ว ทีมงานจะติดต่อกลับ'], 201);
    }
}