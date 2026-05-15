// database/migrations/xxxx_add_monthly_message_count_to_users.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'messages_this_month')) {
                $table->integer('messages_this_month')->default(0);
            }
            if (!Schema::hasColumn('users', 'message_count_reset_at')) {
                $table->timestamp('message_count_reset_at')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['messages_this_month', 'message_count_reset_at']);
        });
    }
};