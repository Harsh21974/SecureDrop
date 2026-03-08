<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('secure_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('type', ['text', 'file']);
            $table->longText('encrypted_data');
            $table->string('filename')->nullable();
            $table->timestamp('expires_at');
            $table->integer('max_views')->default(1);
            $table->integer('view_count')->default(0);
            $table->json('recipients')->nullable();
            $table->string('token')->unique();
            $table->string('password');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secure_items');
    }
};