<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            if (Schema::hasColumn('secure_items', 'password')) {
                $table->dropColumn('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            $table->string('password')->nullable();
        });
    }
};