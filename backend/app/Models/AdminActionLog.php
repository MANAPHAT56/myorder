<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminActionLog extends Model
{
    public $timestamps = false; // มีแค่ created_at ไม่มี updated_at

    protected $fillable = [
        'admin_id', 'action_type', 'target_type',
        'target_id', 'details', 'ip_address', 'created_at',
    ];

    protected $casts = [
        'details'    => 'array',
        'created_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Account::class, 'admin_id');
    }
}