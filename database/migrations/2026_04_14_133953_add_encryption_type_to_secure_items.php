<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            if (!Schema::hasColumn('secure_items', 'encryption_type')) {
                $table->enum('encryption_type', ['password', 'public_key'])->default('public_key')->after('recipient_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            $table->dropColumn('encryption_type');
        });
    }
};