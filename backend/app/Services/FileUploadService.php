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
     * 
     * @param UploadedFile $file
     * @param string $shopRefId
     * @return string (URL ของไฟล์)
     */
public function uploadKyc(UploadedFile $file, string $shopRefId): string
{
    $extension = $file->getClientOriginalExtension();
    $filename = Str::uuid() . '.' . $extension;
    $path = "kyc_documents/{$shopRefId}";

    // ลองอัปโหลดไฟล์
    $storedPath = Storage::putFileAs($path, $file, $filename, 'public');

    // 1. เพิ่มโค้ดเช็คว่าอัปโหลดสำเร็จไหม
    if (!$storedPath) {
        // ถ้าไม่สำเร็จ ให้โยน Error ออกมาตรงๆ จะได้รู้ว่าพังที่จุดนี้
        throw new \Exception("อัปโหลดไฟล์ไป S3 ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า .env และ S3 Bucket");
    }

    // 2. ถ้าสำเร็จ ค่อยส่ง URL กลับไป
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