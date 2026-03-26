<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Account extends Authenticatable
{
    use HasApiTokens;

    protected $primaryKey = 'id';
    public    $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'role_id', 'bookbank_id', 'email', 'google_id',
        'is_email_verified', 'display_name', 'avatar_url',
        'phone_number', 'is_company', 'is_active', 'last_login',
    ];

    protected $hidden = ['google_id'];

    // Relationships
    public function role()        { return $this->belongsTo(Role::class); }
    public function shop()        { return $this->hasOne(Shop::class, 'owner_account_id'); }
    public function bookbank()    { return $this->belongsTo(Bookbank::class); }
    public function reports()     { return $this->hasMany(ReportRequest::class, 'reporter_account_id'); }
    public function claims()      { return $this->hasMany(ClaimRequest::class, 'claimer_account_id'); }

    // Helpers
    public function isAdmin(): bool { return $this->role->name === 'ADMIN'; }
}
