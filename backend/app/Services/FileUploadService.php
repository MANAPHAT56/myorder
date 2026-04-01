<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * UC17: อัปโหลดเอกสาร KYC, หลักฐานรายงาน, หลักฐานเคลม
 * รองรับ driver: local (dev) หรือ s3 (prod)
 * เปลี่ยนที่ config/filesystems.php → FILESYSTEM_DISK=s3
 */
class FileUploadService
{
    /**
     * อัปโหลดเอกสาร KYC สำหรับ Upgrade Request
     */
     * * @param UploadedFile $file
     * @param string $shopRefId
     * @return string (URL ของไฟล์)
    */
    public function uploadKyc(UploadedFile $file, string $shopRefId): string
    {
        // 1. สร้างชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน (กันคนอัปโหลดชื่อไฟล์เดียวกันมาทับ)
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;

        // 2. กำหนด Path ที่จะเก็บใน S3 เช่น kyc_documents/SHOP-999/xxxx-xxxx.jpg
        $path = "kyc_documents/{$shopRefId}";

        // 3. ใช้ Storage facade บันทึกไฟล์ 
        // สังเกตว่าเราไม่ต้องระบุ disk('s3') ถ้าใน .env เราตั้ง FILESYSTEM_DISK=s3 แล้ว
        // ใส่ 'public' ถ้าต้องการให้ไฟล์นี้เปิดดูผ่าน URL ได้โดยตรง
        $storedPath = Storage::putFileAs(
            $path, 
            $file, 
            $filename, 
            'public' 
        );

        // 4. คืนค่าเป็น Full URL ที่สามารถนำไปเปิดดู หรือเซฟลง Database ได้
        return Storage::url($storedPath);
    }

    /**
     * อัปโหลดหลักฐานรายงาน
     */
    public function uploadReport(UploadedFile $file, int $reportId): string
    {
        return $this->upload($file, "reports/{$reportId}");
    }

    /**
     * อัปโหลดหลักฐานเคลม
     */
    public function uploadClaim(UploadedFile $file, int $claimId): string
    {
        return $this->upload($file, "claims/{$claimId}");
    }

    /**
     * core upload — คืน path ที่เก็บใน DB
     * path จะเป็น "kyc/SHOP001/abc123.jpg" เป็นต้น
     */
    private function upload(UploadedFile $file, string $folder): string
    {
        $ext      = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $ext;
        $path     = "{$folder}/{$filename}";

        Storage::disk(config('filesystems.default'))
            ->put($path, file_get_contents($file), 'private');

        return $path;
    }

    /**
     * สร้าง temporary signed URL สำหรับ S3
     * หรือ URL ปกติสำหรับ local
     */
    public function getUrl(string $path): string
    {
        $disk = Storage::disk(config('filesystems.default'));

        if (config('filesystems.default') === 's3') {
            return $disk->temporaryUrl($path, now()->addMinutes(15));
        }

        return $disk->url($path);
    }
}
