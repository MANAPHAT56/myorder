<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insertOrIgnore([
            ['id' => 1, 'name' => 'USER',  'description' => 'ผู้ใช้ทั่วไป / เจ้าของร้านค้า'],
            ['id' => 2, 'name' => 'ADMIN', 'description' => 'ผู้ดูแลระบบ myOrder'],
        ]);
    }
}