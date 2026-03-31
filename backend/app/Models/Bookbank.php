<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookbank extends Model
{
    protected $fillable = [
        'account_id', 'bank_name', 'bank_branch_code',
        'bank_account_holder_name', 'bank_account_number',
        'bank_image_url',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}