<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Blacklist extends Model
{
    public    $timestamps = false;
    protected $fillable   = [
        'shop_ref_id', 'admin_account_id', 'report_request_id', 'reason',
    ];

    protected $casts = ['created_at' => 'datetime'];

    public function shop()   { return $this->belongsTo(Shop::class, 'shop_ref_id', 'ref_id'); }
    public function admin()  { return $this->belongsTo(Account::class, 'admin_account_id'); }
    public function report() { return $this->belongsTo(ReportRequest::class, 'report_request_id'); }
}