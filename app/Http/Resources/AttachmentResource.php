<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'       => $this->id,
            'file_url' => $this->file_url,
            // signed URL สำหรับ S3 (ในระบบจริง generate ตรงนี้)
            // 'signed_url' => Storage::temporaryUrl($this->file_url, now()->addMinutes(15)),
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
        ];
    }
}