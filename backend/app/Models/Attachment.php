<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}