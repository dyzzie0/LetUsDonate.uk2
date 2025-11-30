<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $table = 'Donation';
    protected $primaryKey = 'donation_ID';
    public $timestamps = false;

    protected $fillable = [
        'donor_ID',
        'charity_ID',
        'donation_status',
        'donation_date',
        'pickup_address',
    ];

    // FIXED: Link to users table, not donor table
    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_ID', 'id');
    }

    public function charity()
    {
        return $this->belongsTo(Charity::class, 'charity_ID', 'charity_ID');
    }

    public function items()
    {
        return $this->hasMany(DonationItem::class, 'donation_ID', 'donation_ID');
    }
}
