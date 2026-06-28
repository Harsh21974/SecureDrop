<?php
// database/migrations/2024_01_01_000001_add_stripe_fields_to_users.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('id');
            $table->string('stripe_subscription_id')->nullable();
            $table->string('subscription_status')->default('inactive'); // inactive, active, past_due, cancelled
            $table->timestamp('subscription_ends_at')->nullable();
            $table->string('plan_type')->nullable(); // monthly, yearly
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'stripe_subscription_id',
                'subscription_status',
                'subscription_ends_at',
                'plan_type'
            ]);
        });
    }
};