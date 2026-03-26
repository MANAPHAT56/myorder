<?php

namespace App\Services;

use App\Models\Shop;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * UC8, UC13: ค้นหา กรอง paginate ร้านค้า
 */
class ShopService
{
    /**
     * ค้นหาร้านค้า (สำหรับ public)
     */
    public function search(array $params): LengthAwarePaginator
    {
        $query = Shop::query()->where('is_deleted', false);

        // กรอง blacklist / tier
        match ($params['tier'] ?? 'all') {
            'blacklist' => $query->where('is_blacklist', true),
            'tier1+'    => $query->where('is_blacklist', false),
            'tier2+'    => $query->where('is_blacklist', false)->whereIn('shop_status', ['TIER2', 'TIER3']),
            'tier3'     => $query->where('is_blacklist', false)->where('shop_status', 'TIER3'),
            default     => null, // all — ไม่กรอง tier
        };

        if (! ($params['show_closed'] ?? false)) {
            $query->where('is_active', true);
        }

        if ($q = $params['query'] ?? null) {
            $query->where('name', 'LIKE', "%{$q}%");
        }

        return $query->paginate(
            perPage: $params['per_page'] ?? 8,
            page:    $params['page'] ?? 1
        );
    }

    /**
     * ร้านค้าแนะนำ — tier สูง + active เรียงตาม tier DESC
     */
    public function getFeatured(int $limit = 10)
    {
        return Shop::where('is_deleted', false)
            ->where('is_active', true)
            ->where('is_blacklist', false)
            ->orderByRaw("FIELD(shop_status, 'TIER3', 'TIER2', 'NORMAL')")
            ->limit($limit)
            ->get();
    }

    /**
     * ดูรายละเอียด
     */
    public function findByRefId(string $refId): Shop
    {
        return Shop::where('ref_id', $refId)
            ->where('is_deleted', false)
            ->firstOrFail();
    }

    /**
     * รายการสำหรับ Admin (ไม่ filter is_deleted โดย default)
     */
    public function adminList(array $params): LengthAwarePaginator
    {
        $query = Shop::query();

        if (! ($params['deleted'] ?? false)) {
            $query->where('is_deleted', false);
        }

        if ($params['blacklisted'] ?? false) {
            $query->where('is_blacklist', true);
        }

        if ($q = $params['query'] ?? null) {
            $query->where(function ($q2) use ($q) {
                $q2->where('name', 'LIKE', "%{$q}%")
                   ->orWhere('owner_account_id', 'LIKE', "%{$q}%");
            });
        }

        if ($tier = $params['tier'] ?? null) {
            $statusMap = ['tier1' => 'NORMAL', 'tier2' => 'TIER2', 'tier3' => 'TIER3'];
            if (isset($statusMap[$tier])) {
                $query->where('shop_status', $statusMap[$tier]);
            }
        }

        return $query->with('owner')
            ->latest('updated_at')
            ->paginate($params['per_page'] ?? 8);
    }
}
