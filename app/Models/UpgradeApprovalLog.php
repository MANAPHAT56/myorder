<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class UpgradeApprovalLog extends Model
{
    public    $timestamps = false;
    protected $fillable   = [
        'upgrade_request_id', 'shop_ref_id', 'admin_account_id',
        'action', 'reason', 'processed_at',
    ];

    protected $casts = ['processed_at' => 'datetime'];

    public function shop()          { return $this->belongsTo(Shop::class, 'shop_ref_id', 'ref_id'); }
    public function admin()         { return $this->belongsTo(Account::class, 'admin_account_id'); }
    public function upgradeRequest(){ return $this->belongsTo(UpgradeRequest::class); }
}