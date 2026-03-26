<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,      // ต้องรันก่อน เพราะ accounts FK ไปหา roles
            FraudTypeSeeder::class, // ต้องรันก่อน เพราะ report_requests FK ไปหา fraud_types
            // เพิ่ม seeder อื่นๆ ตามต้องการ:
            // AdminAccountSeeder::class,
            // ShopSeeder::class,
        ]);
    }
}