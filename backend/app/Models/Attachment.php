<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;
class Attachment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'upgrade_request_id', 'claim_request_id', 'file_url', 'created_at',
    ];

    protected $casts = ['created_at' => 'datetime'];

    public function upgradeRequest()
    {
        return $this->belongsTo(UpgradeRequest::class, 'upgrade_request_id');
    }

    public function claimRequest()
    {
        return $this->belongsTo(ClaimRequest::class, 'claim_request_id');
    }
    protected function fileUrl(): Attribute
{
    return Attribute::get(function ($value) {
        if (!$value) return null;

        // ถ้าเป็น URL เต็มอยู่แล้ว (เช่น http...) ให้ส่งกลับไปเลย
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // ถ้าเป็น Path (เช่น claims/xxx.jpg) ให้สร้าง URL ตาม Disk ที่ตั้งไว้
        // หากใช้ S3 จะได้ URL ของ S3, หากใช้ Local จะได้ URL ของ Server เรา
        return Storage::url($value);
    });
}
}
