<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\UpgradeRequest;

class UpgradeRequestPolicy
{
    /**
     * เฉพาะ Admin อนุมัติ/ปฏิเสธได้
     */
    public function review(Account $account): bool
    {
        return $account->isAdmin();
    }

    /**
     * เฉพาะเจ้าของร้านดูรายละเอียดของตัวเองได้
     */
    public function view(Account $account, UpgradeRequest $request): bool
    {
        return $account->isAdmin()
            || $account->shop?->ref_id === $request->shop_ref_id;
    }
}
