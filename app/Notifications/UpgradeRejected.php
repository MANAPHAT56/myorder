<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * แจ้งเจ้าของร้านว่าคำขอเลื่อนขั้นไม่ผ่าน + เหตุผล
 */
class UpgradeRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Shop    $shop,
        public readonly ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("แจ้งผลการขอเลื่อนขั้นร้าน {$this->shop->name}")
            ->greeting("สวัสดีคุณ {$notifiable->display_name}")
            ->line("ขออภัยครับ คำขอเลื่อนขั้นของร้าน **{$this->shop->name}** ไม่ผ่านการพิจารณา");

        if ($this->reason) {
            $mail->line("**เหตุผล:** {$this->reason}");
        }

        return $mail
            ->line("คุณสามารถยื่นคำขอใหม่ได้หลังจากแก้ไขเอกสารให้ครบถ้วน")
            ->line("หากยื่นไม่ผ่านครบ 3 ครั้ง ต้องรอ 30 วันก่อนยื่นใหม่")
            ->action('ยื่นขอเลื่อนขั้นอีกครั้ง', url('/my-shop/upgrade'))
            ->line('หากมีข้อสงสัยติดต่อทีมงาน myOrder ได้เลยครับ');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'        => 'upgrade_rejected',
            'shop_ref_id' => $this->shop->ref_id,
            'shop_name'   => $this->shop->name,
            'reason'      => $this->reason,
            'message'     => "คำขอเลื่อนขั้นร้าน {$this->shop->name} ไม่ผ่านการพิจารณา",
        ];
    }
}
