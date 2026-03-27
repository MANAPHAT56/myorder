<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $primaryKey = 'ref_id';
    public    $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ref_id', 'name', 'channel', 'owner_account_id', 'url',
        'shop_status', 'is_active', 'failed_upgrade_count',
        'is_blacklist', 'is_deleted',
    ];

    protected $casts = [
        'is_active'            => 'boolean',
        'is_blacklist'         => 'boolean',
        'is_deleted'           => 'boolean',
        'failed_upgrade_count' => 'integer',
    ];

    // Scopes
    public function scopeVisible($query)
    {
        return $query->where('is_deleted', false);
    }
    public function scopeNotBlacklisted($query)
    {
        return $query->where('is_blacklist', false);
    }

    // Relationships
    public function owner()          { return $this->belongsTo(Account::class, 'owner_account_id'); }
    public function upgradeRequests(){ return $this->hasMany(UpgradeRequest::class, 'shop_ref_id'); }
    public function reports()        { return $this->hasMany(ReportRequest::class, 'reported_shop_ref_id'); }
    public function claims()         { return $this->hasMany(ClaimRequest::class, 'shop_ref_id'); }
    public function blacklistEntry() { return $this->hasOne(Blacklist::class, 'shop_ref_id'); }
    public function approvalLogs()   { return $this->hasMany(UpgradeApprovalLog::class, 'shop_ref_id'); }

    // Helper: หา last_rejected_at จาก approval logs
    public function lastRejectedAt(): ?\Carbon\Carbon
    {
        return $this->approvalLogs()
            ->where('action', 'rejected')
            ->latest('processed_at')
            ->value('processed_at');
    }

    // Helper: tier number จาก status string
    public function getTierAttribute(): int
    {
        return match ($this->shop_status) {
            'TIER3'  => 3,
            'TIER2'  => 2,
            default  => 1,
        };
    }
}
