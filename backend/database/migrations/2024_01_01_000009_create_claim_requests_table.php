<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('claim_requests', function (Blueprint $table) {
            $table->id();
            $table->string('claimer_account_id', 26);
            $table->string('shop_ref_id', 50);
            $table->string('contact_info', 255)->nullable();
            $table->string('status', 20)->default('pending')
                ->comment('pending|resolved');
            $table->timestamps();

            $table->foreign('claimer_account_id')
                ->references('id')->on('accounts')->onDelete('cascade');
            $table->foreign('shop_ref_id')
                ->references('ref_id')->on('shops')->onDelete('cascade');

            $table->index(['shop_ref_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('claim_requests'); }
};
