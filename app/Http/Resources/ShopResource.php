<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'ref_id'               => $this->ref_id,
            'name'                 => $this->name,
            'channel'              => $this->channel,
            'url'                  => $this->url,
            'shop_status'          => $this->shop_status,   // NORMAL|TIER2|TIER3
            'tier'                 => $this->getTier(),      // 1|2|3
            'is_active'            => $this->is_active,
            'is_blacklist'         => (bool) $this->is_blacklist,
            'is_deleted'           => (bool) $this->is_deleted,
            'failed_upgrade_count' => $this->failed_upgrade_count,
            'owner_account_id'     => $this->owner_account_id,
            'created_at'           => $this->created_at?->format('d/m/Y'),
            'updated_at'           => $this->updated_at?->format('d/m/Y'),
            // Relationships (loaded when needed)
            'upgrade_requests'     => UpgradeRequestResource::collection($this->whenLoaded('upgradeRequests')),
        ];
    }

    private function getTier(): int
    {
        return match ($this->shop_status) {
            'TIER3'     => 3,
            'TIER2'     => 2,
            default     => 1,
        };
    }
}