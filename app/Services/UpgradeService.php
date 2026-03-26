<?php

namespace App\Services;

use App\Models\Shop;
use App\Models\UpgradeRequest;
use App\Models\Attachment;
use Carbon\Carbon;

/**
 * UC20: ตรวจ failed_count + cooldown 30 วัน
 * ต้องตรงกับ logic ใน frontend UpgradePage เป๊ะ
 */
class UpgradeService
{
    private const MAX_FAILS   = 3;
    private const COOLDOWN_DAYS = 30;

    /**
     * ตรวจสิทธิ์ก่อน submit
     * คืน array ที่ตรงกับ state ใน frontend UpgradePage Step 0
     */
    public function checkEligibility(Shop $shop): array
    {
        $failedCount = $shop->failed_upgrade_count;

        // ยังไม่ครบ MAX_FAILS → ยื่นได้
        if ($failedCount < self::MAX_FAILS) {
            return [
                'eligible'     => true,
                'failed_count' => $failedCount,
                'days_remaining' => 0,
                'was_reset'    => false,
            ];
        }

        // ครบแล้ว → ตรวจว่าครบ 30 วันหรือยัง
        $lastRejectedAt = $shop->lastRejectedAt();

        if (! $lastRejectedAt) {
            // ไม่มีประวัติ reject แต่ count ≥ 3 (ข้อมูลผิดปกติ) → อนุญาต
            return [
                'eligible'     => true,
                'failed_count' => 0,
                'days_remaining' => 0,
                'was_reset'    => true,
            ];
        }

        $diffDays = (int) $lastRejectedAt->diffInDays(Carbon::now(), false);
        $daysLeft = self::COOLDOWN_DAYS - $diffDays;

        if ($daysLeft > 0) {
            // ยังต้องรออยู่
            return [
                'eligible'       => false,
                'failed_count'   => $failedCount,
                'days_remaining' => $daysLeft,
                'was_reset'      => false,
            ];
        }

        // ครบ 30 วันแล้ว → reset failed_count
        $shop->update(['failed_upgrade_count' => 0]);

        return [
            'eligible'       => true,
            'failed_count'   => 0,
            'days_remaining' => 0,
            'was_reset'      => true,
        ];
    }

    /**
     * สร้าง UpgradeRequest + บันทึก Attachments
     */
    public function submit(Shop $shop, array $uploadedFiles): UpgradeRequest
    {
        // ยกเลิก pending request เก่า (ถ้ามี)
        UpgradeRequest::where('shop_ref_id', $shop->ref_id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        $upgradeRequest = UpgradeRequest::create([
            'shop_ref_id' => $shop->ref_id,
            'status'      => 'pending',
        ]);

        foreach ($uploadedFiles as $fileData) {
            Attachment::create([
                'upgrade_request_id' => $upgradeRequest->id,
                'file_url'           => $fileData['file_url'],
            ]);
        }

        return $upgradeRequest;
    }
}
