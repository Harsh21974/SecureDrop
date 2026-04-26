<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            $table->foreignId('recipient_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->enum('encryption_type', ['password', 'public_key'])->default('password')->after('recipient_id');
        });
    }

    public function down(): void
    {
        Schema::table('secure_items', function (Blueprint $table) {
            $table->dropForeign(['recipient_id']);
            $table->dropColumn(['recipient_id', 'encryption_type']);
        });
    }
};