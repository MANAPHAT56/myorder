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
     * * @param UploadedFile $file
     * @param string $shopRefId
     * @return string (URL ของไฟล์)
     */
    public function uploadKyc(UploadedFile $file, string $shopRefId): string
    {
        // 1. เรียกใช้ฟังก์ชันแกนกลาง อัปโหลดเข้า S3 แบบ Private
        $path = $this->upload($file, "kyc_documents/{$shopRefId}");
        
        // 2. คืนค่ากลับไปเป็น Signed URL (มีอายุ 15 นาที) เพื่อให้ Frontend นำไปแสดงผลได้
        return $this->getUrl($path);
    }

    /**
     * อัปโหลดหลักฐานรายงาน
     */
    public function uploadReport(UploadedFile $file, int $reportId): string
    {
        // คืนค่าเป็น Path เอาไปเซฟลง Database
        return $this->upload($file, "reports/{$reportId}");
    }

    /**
     * อัปโหลดหลักฐานเคลม
     */
    public function uploadClaim(UploadedFile $file, int $claimId): string
    {
        // คืนค่าเป็น Path เอาไปเซฟลง Database
        return $this->upload($file, "claims/{$claimId}");
    }

    /**
     * --------------------------------------------------
     * CORE UPLOAD (ฟังก์ชันแกนกลาง)
     * --------------------------------------------------
     * คืนค่า path ที่เก็บใน DB เช่น "claims/1/abc123.jpg"
     */
    private function upload(UploadedFile $file, string $folder, string $visibility = 'private'): string
    {
        $ext      = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $ext;

        // ใช้ putFileAs แทน file_get_contents() จะช่วยเซฟ RAM ไม่ให้เซิร์ฟเวอร์โหลดหนักเวลาเจอไฟล์คลิปวิดีโอใหญ่ๆ
        $storedPath = Storage::putFileAs($folder, $file, $filename, $visibility);

        // ดัก Error ถ้าระบบอัปโหลดเข้า S3 ไม่สำเร็จ
        if (!$storedPath) {
            throw new \Exception("อัปโหลดไฟล์ไป S3 ไม่สำเร็จ (Folder: {$folder}) กรุณาตรวจสอบการตั้งค่า AWS ในไฟล์ .env");
        }

        return $storedPath;
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