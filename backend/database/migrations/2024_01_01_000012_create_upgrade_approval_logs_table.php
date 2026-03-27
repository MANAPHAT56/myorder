<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('upgrade_approval_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('upgrade_request_id')->nullable();
            $table->string('shop_ref_id', 50);
            $table->string('admin_account_id', 26);
            $table->string('action', 20)->comment('approved|rejected|cancelled');
            $table->text('reason')->nullable();
            $table->timestamp('processed_at')->useCurrent();

            $table->foreign('upgrade_request_id')
                ->references('id')->on('upgrade_requests')->onDelete('cascade');
            $table->foreign('shop_ref_id')
                ->references('ref_id')->on('shops')->onDelete('cascade');
            $table->foreign('admin_account_id')
                ->references('id')->on('accounts')->onDelete('restrict');

            // index สำหรับ lastRejectedAt() query ใน Shop model
            $table->index(['shop_ref_id', 'action', 'processed_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('upgrade_approval_logs'); }
};
