<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FraudType extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function claimRequests()
    {
        return $this->hasMany(ClaimRequest::class, 'fraud_type_id');
    }
}