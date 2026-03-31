<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'description'];

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
}