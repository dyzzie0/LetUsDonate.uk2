<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('User', function (Blueprint $table) {
            $table->unique('user_email');
        });
    }

    public function down()
    {
        Schema::table('User', function (Blueprint $table) {
            $table->dropUnique(['user_email']);
        });
    }
};
