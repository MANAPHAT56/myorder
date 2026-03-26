<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    public    $timestamps = false;
    protected $fillable   = [
        'upgrade_request_id', 'report_request_id',
        'claim_request_id', 'file_url',
    ];

    protected $casts = ['created_at' => 'datetime'];
}