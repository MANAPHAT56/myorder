<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class UpgradeRequest extends Model
{
    protected $fillable = [
        'shop_ref_id', 'status', 'admin_remark',
    ];

    public function shop()        { return $this->belongsTo(Shop::class, 'shop_ref_id', 'ref_id'); }
    public function attachments() { return $this->hasMany(Attachment::class, 'upgrade_request_id'); }
    public function logs()        { return $this->hasMany(UpgradeApprovalLog::class, 'upgrade_request_id'); }
}