<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\UpgradeRequest;
use App\Models\ClaimRequest;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/v1/admin/dashboard
     */
    public function index(Request $request)
    {
        // 1. นับจำนวนร้านค้าทั้งหมด (ไม่รวมที่ถูก Soft Delete ไปแล้ว)
        $totalShops = Shop::count();

        // 2. นับจำนวนร้านค้าที่ติด Blacklist
        $blacklisted = Shop::where('is_blacklist', true)->count();

        // 3. นับจำนวนคำขอเลื่อนขั้นที่สถานะเป็น pending
        $pendingUpgrades = UpgradeRequest::where('status', 'pending')->count();

        // 4. นับจำนวนคำร้องเคลมที่สถานะเป็น pending
        $pendingClaims = ClaimRequest::where('status', 'pending')->count();

        // ส่งข้อมูลกลับไปเป็น JSON ให้ตรงกับที่ Frontend (React) ต้องการ
        return response()->json([
            'total_shops'      => $totalShops,
            'blacklisted'      => $blacklisted,
            'pending_upgrades' => $pendingUpgrades,
            'pending_claims'   => $pendingClaims,
        ]);
    }
}