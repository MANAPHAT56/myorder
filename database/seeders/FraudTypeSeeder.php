<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FraudTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'สินค้าไม่ตรงรูป',       'description' => 'ของที่ได้รับแตกต่างจากรูปโปรไฟล์'],
            ['name' => 'โกงเงิน / ไม่ส่งของ',    'description' => 'โอนเงินแล้วร้านหายหรือไม่ส่งของ'],
            ['name' => 'ร้านค้าปลอม',            'description' => 'แอบอ้างชื่อร้านหรือตัวตนปลอม'],
            ['name' => 'ข้อมูลร้านค้าผิด',       'description' => 'ที่อยู่หรือข้อมูลติดต่อไม่ถูกต้อง'],
            ['name' => 'อื่นๆ',                  'description' => 'ปัญหาอื่นที่ไม่อยู่ในหมวดด้านบน'],
        ];

        foreach ($types as $type) {
            DB::table('fraud_types')->insertOrIgnore([
                ...$type,
                'is_active' => true,
            ]);
        }
    }
}
