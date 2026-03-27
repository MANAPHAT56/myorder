<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Account;
use App\Models\Role;

/**
 * สร้าง Admin account เริ่มต้น
 * รัน: php artisan db:seed --class=AdminAccountSeeder
 */
class AdminAccountSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'ADMIN')->firstOrFail();

        Account::firstOrCreate(
            ['email' => 'admin@myorder.co.th'],
            [
                'id'                => Str::ulid(),
                'role_id'           => $adminRole->id,
                'display_name'      => 'myOrder Admin',
                'is_email_verified' => true,
                'is_active'         => true,
            ]
        );

        $this->command->info('Admin account created: admin@myorder.co.th');
        $this->command->warn('หมายเหตุ: Admin ต้อง login ผ่าน Google OAuth — ตั้ง google_id ให้ตรงกับ Google account จริง');
    }
}
