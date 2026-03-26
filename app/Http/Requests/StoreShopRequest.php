<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:255', 'regex:/^[\x{0E00}-\x{0E7F}a-zA-Z0-9\s\-_.,:()]+$/u'],
            'channel'          => ['nullable', 'string', 'max:50'],
            'url'              => ['required', 'url', 'max:500'],
            'owner_account_id' => ['required', 'exists:accounts,id'],
            'shop_status'      => ['nullable', 'in:NORMAL,TIER2,TIER3,BLACKLIST'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'กรุณากรอกชื่อร้านค้า',
            'name.regex'                => 'ชื่อร้านค้าไม่อนุญาตให้ใช้อักขระพิเศษหรืออีโมจิ',
            'url.required'              => 'กรุณากรอก URL ติดต่อ',
            'url.url'                   => 'URL ต้องขึ้นต้นด้วย http:// หรือ https://',
            'owner_account_id.exists'   => 'ไม่พบ User ID นี้ในระบบ',
        ];
    }
}
