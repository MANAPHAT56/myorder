<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Account;
use Illuminate\Support\Carbon;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'id'                => 'ACC-001',
                'role_id'           => 1,
                'email'             => 'user1@email.com',
                'password_hash'     => null,
                'google_id'         => null,
                'is_email_verified' => false,
                'display_name'      => 'John Shop Owner',
                'avatar_url'        => null,
                'phone_number'      => null,
                'is_company'        => false,
                'is_active'         => true,
                'last_login'        => null,
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ],
            [
                'id'                => 'ACC-002',
                'role_id'           => 2,
                'email'             => 'admin1@email.com',
                'password_hash'     => null,
                'google_id'         => null,
                'is_email_verified' => false,
                'display_name'      => 'Super Admin',
                'avatar_url'        => null,
                'phone_number'      => null,
                'is_company'        => false,
                'is_active'         => true,
                'last_login'        => null,
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ],
            [
                'id'                => 'ACC-003',
                'role_id'           => 1,
                'email'             => 'buyer1@email.com',
                'password_hash'     => null,
                'google_id'         => null,
                'is_email_verified' => false,
                'display_name'      => 'Angry Buyer',
                'avatar_url'        => null,
                'phone_number'      => null,
                'is_company'        => false,
                'is_active'         => true,
                'last_login'        => null,
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ],
        ];

        foreach ($data as $item) {
            Account::create($item);
        }
    }
}