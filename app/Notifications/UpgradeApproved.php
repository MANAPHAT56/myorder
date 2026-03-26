<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * แจ้งเจ้าของร้านว่าคำขอเลื่อนขั้นได้รับการอนุมัติ
 * Dispatch จาก ProcessUpgradeApproval Job
 */
class UpgradeApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Shop $shop) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("🎉 ร้าน {$this->shop->name} ได้รับการเลื่อนขั้นแล้ว!")
            ->greeting("สวัสดีคุณ {$notifiable->display_name}")
            ->line("ยินดีด้วย! ร้านค้า **{$this->shop->name}** ของคุณ")
            ->line("ได้รับการยืนยันตัวตนและเลื่อนขั้นเรียบร้อยแล้ว")
            ->line("ระดับปัจจุบัน: **ขั้นที่ 2** (ยืนยันตัวตนด้วยเอกสาร)")
            ->action('ดูร้านค้าของฉัน', url('/my-shop'))
            ->line('ขอบคุณที่ไว้วางใจ myOrder ครับ');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'         => 'upgrade_approved',
            'shop_ref_id'  => $this->shop->ref_id,
            'shop_name'    => $this->shop->name,
            'message'      => "ร้าน {$this->shop->name} ได้รับการเลื่อนขั้นแล้ว",
        ];
    }
}
