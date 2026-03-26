<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\Shop;

class ShopPolicy
{
    /**
     * เฉพาะเจ้าของร้านหรือ Admin เท่านั้นที่แก้ไขได้
     */
    public function update(Account $account, Shop $shop): bool
    {
        return $account->isAdmin()
            || $shop->owner_account_id === $account->id;
    }

    /**
     * เฉพาะ Admin เท่านั้นที่ลบได้
     */
    public function delete(Account $account, Shop $shop): bool
    {
        return $account->isAdmin();
    }

    /**
     * เฉพาะ Admin เท่านั้นที่เพิ่ม Blacklist ได้
     */
    public function blacklist(Account $account): bool
    {
        return $account->isAdmin();
    }
}