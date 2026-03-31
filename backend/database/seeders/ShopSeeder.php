<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // ดึง ID ของ Account ทั้งหมดที่มีในระบบมาสุ่มเป็นเจ้าของร้าน
        $accountIds = DB::table('accounts')->pluck('id')->toArray();

        // เช็คเผื่อกรณีลืมรัน AccountSeeder ก่อน
        if (empty($accountIds)) {
            $this->command->error('No accounts found! Please run AccountSeeder first.');
            return;
        }

        // สร้างข้อมูลจำลองร้านค้า 3 ร้าน
        $shops = [
            [
                'ref_id' => 'SHOP-0001',
                'name' => 'ร้านขายดีเจริญรุ่งเรือง',
                'channel' => 'FACEBOOK',
                'owner_account_id' => $accountIds[0] ?? null, // เอา Account คนแรกมาเป็นเจ้าของ
                'url' => 'https://facebook.com/shop001',
                'shop_status' => 'NORMAL',
                'is_active' => true,
                'failed_upgrade_count' => 0,
                'is_blacklist' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ref_id' => 'SHOP-0002',
                'name' => 'ร้านขั้นสุดยอด (Tier 2)',
                'channel' => 'TIKTOK',
                'owner_account_id' => count($accountIds) > 1 ? $accountIds[1] : $accountIds[0],
                'url' => 'https://tiktok.com/@shop002',
                'shop_status' => 'TIER2',
                'is_active' => true,
                'failed_upgrade_count' => 1,
                'is_blacklist' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'ref_id' => 'SHOP-0003',
                'name' => 'ร้านโดนแบน',
                'channel' => 'SHOPEE',
                'owner_account_id' => count($accountIds) > 2 ? $accountIds[2] : $accountIds[0],
                'url' => 'https://shopee.co.th/shop003',
                'shop_status' => 'BLACKLIST',
                'is_active' => false, // ปิดร้าน
                'failed_upgrade_count' => 0,
                'is_blacklist' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('shops')->insert($shops);
    }
}