<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

use Laravel\Sanctum\HasApiTokens;

    class Account extends Authenticatable
    {
        use HasApiTokens;

        protected $primaryKey = 'id';
        public $incrementing  = false;
        protected $keyType    = 'string';

        protected $fillable = [
            'id', 'role_id', 'email', 'password_hash',
            'google_id', 'is_email_verified', 'display_name',
            'avatar_url', 'phone_number', 'is_company',
            'is_active', 'last_login',
        ];

        protected $hidden = ['password_hash'];

        protected $casts = [
            'is_email_verified' => 'boolean',
            'is_company'        => 'boolean',
            'is_active'         => 'boolean',
            'last_login'        => 'datetime',
        ];

        public function role()
        {
            return $this->belongsTo(Role::class);
        }

        public function shop()
        {
            return $this->hasOne(Shop::class, 'owner_account_id');
        }

        public function bookbanks()
        {
            return $this->hasMany(Bookbank::class, 'account_id');
        }

        public function claimRequests()
        {
            return $this->hasMany(ClaimRequest::class, 'claimer_account_id');
        }
    }