<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('public_key')->nullable()->after('is_premium');
            $table->text('encrypted_private_key')->nullable()->after('public_key');
            $table->string('key_version')->default('1')->after('encrypted_private_key');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['public_key', 'encrypted_private_key', 'key_version']);
        });
    }
};