<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();

        // 1. roles
        DB::table('roles')->insert([
            ['name' => 'USER', 'description' => 'ผู้ใช้งานทั่วไป'],
            ['name' => 'ADMIN', 'description' => 'ผู้ดูแลระบบ'],
        ]);

        // 2. fraud_types
        DB::table('fraud_types')->insert([
            ['name' => 'ส่งของไม่ตรงปก', 'description' => 'ได้รับสินค้าไม่ตรงตามที่ตกลงไว้', 'is_active' => true],
            ['name' => 'โอนเงินแล้วไม่ส่งของ', 'description' => 'จ่ายเงินแล้วผู้ขายเงียบหาย บล็อกช่องทางติดต่อ', 'is_active' => true],
            ['name' => 'สินค้าปลอม/ละเมิดลิขสิทธิ์', 'description' => 'อ้างว่าเป็นของแท้แต่ส่งของปลอมมาให้', 'is_active' => true],
        ]);

        // 3. accounts
        // สร้าง ULID แบบ 26 ตัวอักษร
        $adminId = (string) Str::ulid();
        $sellerId = (string) Str::ulid();
        $buyerId = (string) Str::ulid();

        DB::table('accounts')->insert([
            [
                'id' => $adminId,
                'role_id' => 2, // ADMIN
                'email' => 'admin@system.local',
                'password_hash' => Hash::make('password123'),
                'google_id' => null,
                'is_email_verified' => true,
                'display_name' => 'System Admin',
                'avatar_url' => null,
                'phone_number' => '0800000000',
                'is_company' => false,
                'is_active' => true,
                'last_login' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $sellerId,
                'role_id' => 1, // USER
                'email' => 'seller@shop.local',
                'password_hash' => Hash::make('password123'),
                'google_id' => 'google_1234567890',
                'is_email_verified' => true,
                'display_name' => 'Seller Shop',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Seller',
                'phone_number' => '0811111111',
                'is_company' => true,
                'is_active' => true,
                'last_login' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $buyerId,
                'role_id' => 1, // USER
                'email' => 'victim@mail.local',
                'password_hash' => Hash::make('password123'),
                'google_id' => null,
                'is_email_verified' => true,
                'display_name' => 'Victim Buyer',
                'avatar_url' => null,
                'phone_number' => '0822222222',
                'is_company' => false,
                'is_active' => true,
                'last_login' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 4. bookbanks
        DB::table('bookbanks')->insert([
            [
                'account_id' => $sellerId,
                'bank_name' => 'KBank',
                'bank_branch_code' => '001',
                'bank_account_holder_name' => 'นาย พ่อค้า ขายดี',
                'bank_account_number' => '1234567890',
                'bank_image_url' => 'https://example.com/bookbank.jpg',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 5. shops
        $shopRefId = 'SHOP-' . strtoupper(Str::random(10));
        DB::table('shops')->insert([
            [
                'ref_id' => $shopRefId,
                'name' => 'ร้านขายส่งมือถือ ราคาถูก',
                'channel' => 'Facebook',
                'owner_account_id' => $sellerId,
                'url' => 'https://facebook.com/fakemobileshop',
                'current_tier' => 'TIER_1',
                'is_active' => true,
                'failed_upgrade_count' => 0,
                'is_blacklist' => true, // โดนแบนภายหลัง
                'created_at' => clone $now->subDays(30),
                'updated_at' => $now,
                'deleted_at' => null,
            ]
        ]);

        // 6. admin_action_logs
        DB::table('admin_action_logs')->insert([
            [
                'admin_id' => $adminId,
                'action_type' => 'BLACKLIST_SHOP',
                'target_type' => 'shops',
                'target_id' => $shopRefId,
                'details' => json_encode(['reason' => 'มีคนร้องเรียนหลายราย']),
                'ip_address' => '192.168.1.100',
                'created_at' => $now,
            ]
        ]);

        // 7. upgrade_requests
        $upgradeRequestId = DB::table('upgrade_requests')->insertGetId([
            'shop_ref_id' => $shopRefId,
            'status' => 'rejected',
            'admin_remark' => 'เอกสารยืนยันตัวตนไม่ชัดเจน',
            'created_at' => clone $now->subDays(20),
            'updated_at' => clone $now->subDays(19),
        ]);

        // 8. claim_requests
        $claimRequestId = DB::table('claim_requests')->insertGetId([
            'claimer_account_id' => $buyerId,
            'shop_ref_id' => $shopRefId,
            'fraud_type_id' => 2, // โอนเงินแล้วไม่ส่งของ
            'reason' => 'โอนเงินค่ามือถือไป 5,000 บาท ผ่านไป 7 วันไม่อ่านแชท ไม่ส่งของ',
            'contact_info' => 'Line: victim_2026',
            'status' => 'approved',
            'created_at' => clone $now->subDays(5),
            'updated_at' => clone $now->subDays(1),
        ]);

        // 9. blacklists
        DB::table('blacklists')->insert([
            [
                'shop_ref_id' => $shopRefId,
                'admin_account_id' => $adminId,
                'claim_request_id' => $claimRequestId,
                'reason' => 'ผู้ขายมีพฤติกรรมฉ้อโกงตามที่ผู้เสียหายแจ้งเข้ามาและตรวจสอบบัญชีพบว่าปิดหนีแล้ว',
                'created_at' => $now,
            ]
        ]);

        // 10. attachments
        DB::table('attachments')->insert([
            [
                'upgrade_request_id' => $upgradeRequestId,
                'claim_request_id' => null,
                'file_url' => 'https://storage.local/uploads/upgrades/id_card.png',
                'created_at' => clone $now->subDays(20),
            ],
            [
                'upgrade_request_id' => null,
                'claim_request_id' => $claimRequestId,
                'file_url' => 'https://storage.local/uploads/claims/slip_5000.png',
                'created_at' => clone $now->subDays(5),
            ],
            [
                'upgrade_request_id' => null,
                'claim_request_id' => $claimRequestId,
                'file_url' => 'https://storage.local/uploads/claims/chat_log.pdf',
                'created_at' => clone $now->subDays(5),
            ]
        ]);
    }
}