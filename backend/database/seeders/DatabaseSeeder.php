<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('เริ่มทำการจำลองข้อมูล (Seeding)...');

        // ==========================================
        // ลำดับที่ 1: ตารางพื้นฐาน (Master Tables)
        // ==========================================
        $this->command->info('1. กำลังเพิ่มข้อมูล Roles และ Fraud Types');
        
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'USER', 'description' => 'ผู้ใช้งานทั่วไป และเจ้าของร้านค้า'],
            ['id' => 2, 'name' => 'ADMIN', 'description' => 'ผู้ดูแลระบบ'],
        ]);

        DB::table('fraud_types')->insert([
            ['id' => 1, 'name' => 'ไม่ส่งสินค้า', 'description' => 'โอนเงินแล้วร้านค้าหายเงียบ ไม่ยอมส่งสินค้า', 'is_active' => 1],
            ['id' => 2, 'name' => 'สินค้าไม่ตรงปก', 'description' => 'ส่งสินค้ามาให้แต่ไม่ตรงกับที่โฆษณาไว้', 'is_active' => 1],
        ]);

        // ==========================================
        // ลำดับที่ 2: ตารางผู้ใช้งาน และ ร้านค้า
        // ==========================================
        $this->command->info('2. กำลังเพิ่มข้อมูล Accounts, Bookbanks และ Shops');

        DB::table('accounts')->insert([
            ['id' => 'ACC-001', 'role_id' => 1, 'email' => 'user1@email.com', 'display_name' => 'John Shop Owner', 'is_active' => 1],
            ['id' => 'ACC-002', 'role_id' => 2, 'email' => 'admin1@email.com', 'display_name' => 'Super Admin', 'is_active' => 1],
            ['id' => 'ACC-003', 'role_id' => 1, 'email' => 'buyer1@email.com', 'display_name' => 'Angry Buyer', 'is_active' => 1],
        ]);

        DB::table('bookbanks')->insert([
            [
                'account_id' => 'ACC-001', 
                'bank_name' => 'KBank', 
                'bank_account_holder_name' => 'Mr. John Doe', 
                'bank_account_number' => '123-4-56789-0'
            ],
        ]);

        DB::table('shops')->insert([
            [
                'ref_id' => 'SHOP-999', 
                'name' => 'ร้านเสื้อผ้า John', 
                'owner_account_id' => 'ACC-001', 
                'current_tier' => 'TIER_1', 
                'is_active' => 1
            ],
        ]);

        // ==========================================
        // ลำดับที่ 3: ตารางการดำเนินการต่างๆ (Transactions)
        // ==========================================
        $this->command->info('3. กำลังเพิ่มข้อมูล Action Logs, Upgrade Requests และ Claim Requests');

        DB::table('admin_action_logs')->insert([
            [
                'admin_id' => 'ACC-002', 
                'action_type' => 'VERIFY_SHOP', 
                'target_type' => 'shops', 
                'target_id' => 'SHOP-999', 
                'details' => json_encode(['remark' => 'ตรวจสอบเอกสารผ่านแล้ว']), 
                'ip_address' => '192.168.1.1'
            ],
        ]);

        DB::table('upgrade_requests')->insert([
            ['id' => 1, 'shop_ref_id' => 'SHOP-999', 'status' => 'pending'],
        ]);

        DB::table('claim_requests')->insert([
            [
                'id' => 1, 
                'claimer_account_id' => 'ACC-003', 
                'shop_ref_id' => 'SHOP-999', 
                'fraud_type_id' => 1, 
                'reason' => 'โอนเงินไป 500 บาทตั้งแต่อาทิตย์ที่แล้ว ติดต่อไม่ได้เลย', 
                'status' => 'pending'
            ],
        ]);

        // ==========================================
        // ลำดับที่ 4: ตารางไฟล์แนบ และ แบล็คลิสต์
        // ==========================================
        $this->command->info('4. กำลังเพิ่มข้อมูล Attachments และ Blacklists');

        DB::table('attachments')->insert([
            ['claim_request_id' => 1, 'upgrade_request_id' => null, 'file_url' => 'https://storage.example.com/slips/slip_001.jpg'],
            ['claim_request_id' => null, 'upgrade_request_id' => 1, 'file_url' => 'https://storage.example.com/docs/id_card_001.jpg'],
        ]);

        DB::table('blacklists')->insert([
            [
                'shop_ref_id' => 'SHOP-999', 
                'admin_account_id' => 'ACC-002', 
                'claim_request_id' => 1, 
                'reason' => 'โกงลูกค้าจริง ตรวจสอบสลิปแล้ว แบนถาวร'
            ],
        ]);

        $this->command->info('จำลองข้อมูลเสร็จสมบูรณ์เรียบร้อยแล้ว! 🎉');
    }
}