<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secure_item_recipients', function (Blueprint $table) {
            if (!Schema::hasColumn('secure_item_recipients', 'view_count')) {
                $table->integer('view_count')->default(0)->after('encrypted_aes_key');
            }
            if (!Schema::hasColumn('secure_item_recipients', 'max_views')) {
                $table->integer('max_views')->default(1)->after('view_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('secure_item_recipients', function (Blueprint $table) {
            $table->dropColumn(['view_count', 'max_views']);
        });
    }
};