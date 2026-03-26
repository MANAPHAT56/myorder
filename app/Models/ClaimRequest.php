<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ClaimRequest extends Model
{
    protected $fillable = [
        'claimer_account_id', 'shop_ref_id', 'contact_info', 'status',
    ];

    public function claimer()     { return $this->belongsTo(Account::class, 'claimer_account_id'); }
    public function shop()        { return $this->belongsTo(Shop::class, 'shop_ref_id', 'ref_id'); }
    public function attachments() { return $this->hasMany(Attachment::class, 'claim_request_id'); }
}