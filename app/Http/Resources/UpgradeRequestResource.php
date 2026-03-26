<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class UpgradeRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'shop_ref_id'    => $this->shop_ref_id,
            'status'         => $this->status,       // pending|approved|rejected
            'admin_remark'   => $this->admin_remark,
            'created_at'     => $this->created_at?->format('d/m/Y'),
            'updated_at'     => $this->updated_at?->format('d/m/Y'),
            'shop'           => new ShopResource($this->whenLoaded('shop')),
            'attachments'    => AttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}