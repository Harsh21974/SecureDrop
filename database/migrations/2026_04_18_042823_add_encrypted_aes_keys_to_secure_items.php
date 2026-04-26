<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            if (!Schema::hasColumn('secure_items', 'encrypted_aes_keys')) {
                $table->json('encrypted_aes_keys')->nullable()->after('encrypted_data');
            }
        });
    }

    public function down(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            $table->dropColumn('encrypted_aes_keys');
        });
    }
};