<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('blacklists', function (Blueprint $table) {
            $table->id();
            $table->string('shop_ref_id', 50);
            $table->string('admin_account_id', 26);
            $table->unsignedBigInteger('report_request_id')->nullable();
            $table->text('reason');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('shop_ref_id')
                ->references('ref_id')->on('shops')->onDelete('cascade');
            $table->foreign('admin_account_id')
                ->references('id')->on('accounts')->onDelete('restrict');
            $table->foreign('report_request_id')
                ->references('id')->on('report_requests')->onDelete('set null');
        });
    }
    public function down(): void { Schema::dropIfExists('blacklists'); }
};
