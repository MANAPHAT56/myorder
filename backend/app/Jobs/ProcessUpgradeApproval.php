<?php

namespace App\Jobs;

use App\Models\UpgradeRequest;
use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Job: ประมวลผลหลังอนุมัติ/ปฏิเสธ Upgrade Request
 * Dispatch จาก AdminUpgradeController หลัง approve/reject
 */
class ProcessUpgradeApproval implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly UpgradeRequest $upgradeRequest,
        public readonly string         $action,   // 'approved' | 'rejected'
        public readonly ?string        $reason = null,
    ) {}

    public function handle(): void
    {
        $shop = $this->upgradeRequest->shop;

        if ($this->action === 'approved') {
            // แจ้ง owner ว่าผ่านแล้ว
            $shop->owner?->notify(new \App\Notifications\UpgradeApproved($shop));
        } else {
            // แจ้ง owner ว่าไม่ผ่านพร้อมเหตุผล
            $shop->owner?->notify(new \App\Notifications\UpgradeRejected($shop, $this->reason));
        }
    }
}
