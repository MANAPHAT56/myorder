<?php

namespace App\Services;

use App\Models\Shop;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ShopService
{
    public function search(array $params): LengthAwarePaginator
    {
        $query = Shop::query();

        match ($params['tier'] ?? 'all') {
            'blacklist' => $query->where('is_blacklist', true),
            'tier1+'    => $query->where('is_blacklist', false),
            // แก้ TIER2 → TIER_2, TIER3 → TIER_3
            'tier2+'    => $query->where('is_blacklist', false)->whereIn('current_tier', ['TIER_2', 'TIER_3']),
            'tier3'     => $query->where('is_blacklist', false)->where('current_tier', 'TIER_3'),
            default     => null,
        };

        if (!($params['show_closed'] ?? false)) {
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

    public function getFeatured(int $limit = 10)
    {
        return Shop::where('is_active', true)
            ->where('is_blacklist', false)
            // แก้ TIER3 → TIER_3, TIER2 → TIER_2, NORMAL → TIER_1
            ->orderByRaw("FIELD(current_tier, 'TIER_3', 'TIER_2', 'TIER_1')")
            ->limit($limit)
            ->get();
    }

    public function findByRefId(string $refId): Shop
    {
        return Shop::where('ref_id', $refId)->firstOrFail();
    }

    public function adminList(array $params): LengthAwarePaginator
    {
        $query = Shop::query();

        if ($params['deleted'] ?? false) {
            $query->withTrashed();
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
            // แก้ column shop_status → current_tier
            // แก้ค่า NORMAL → TIER_1, TIER2 → TIER_2, TIER3 → TIER_3
            $tierMap = [
                'TIER_1' => 'TIER_1',
                'TIER_2' => 'TIER_2',
                'TIER_3' => 'TIER_3',
            ];
            if (isset($tierMap[$tier])) {
                $query->where('current_tier', $tierMap[$tier]);
            }
        }

        return $query->with('owner')
            ->latest('updated_at')
            ->paginate($params['per_page'] ?? 8);
    }
}