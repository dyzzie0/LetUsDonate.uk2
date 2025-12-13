<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
{
    Schema::table('inventory', function (Blueprint $table) {
        $table->boolean('distributed')->default(false);
    });
}

public function down()
{
    Schema::table('inventory', function (Blueprint $table) {
        $table->dropColumn('distributed');
    });
}

};
