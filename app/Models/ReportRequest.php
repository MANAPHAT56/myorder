<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ReportRequest extends Model
{
    protected $fillable = [
        'reporter_account_id', 'reported_shop_ref_id',
        'fraud_type_id', 'reason', 'status',
    ];

    public function reporter()    { return $this->belongsTo(Account::class, 'reporter_account_id'); }
    public function shop()        { return $this->belongsTo(Shop::class, 'reported_shop_ref_id', 'ref_id'); }
    public function fraudType()   { return $this->belongsTo(FraudType::class); }
    public function attachments() { return $this->hasMany(Attachment::class, 'report_request_id'); }
}