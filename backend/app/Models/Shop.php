<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shop extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'ref_id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'ref_id', 'name', 'channel', 'owner_account_id',
        'url', 'current_tier', 'is_active',
        'failed_upgrade_count', 'is_blacklist',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'is_blacklist' => 'boolean',
        'deleted_at'   => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(Account::class, 'owner_account_id');
    }

    public function upgradeRequests()
    {
        return $this->hasMany(UpgradeRequest::class, 'shop_ref_id', 'ref_id');
    }

    public function claimRequests()
    {
        return $this->hasMany(ClaimRequest::class, 'shop_ref_id', 'ref_id');
    }

    public function blacklists()
    {
        return $this->hasMany(Blacklist::class, 'shop_ref_id', 'ref_id');
    }
}