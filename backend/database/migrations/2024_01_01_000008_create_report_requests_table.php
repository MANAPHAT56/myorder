<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('report_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reporter_account_id', 26);
            $table->string('reported_shop_ref_id', 50);
            $table->unsignedBigInteger('fraud_type_id');
            $table->text('reason');
            $table->string('status', 20)->default('pending')
                ->comment('pending|resolved');
            $table->timestamps();

            $table->foreign('reporter_account_id')
                ->references('id')->on('accounts')->onDelete('cascade');
            $table->foreign('reported_shop_ref_id')
                ->references('ref_id')->on('shops')->onDelete('cascade');
            $table->foreign('fraud_type_id')
                ->references('id')->on('fraud_types')->onDelete('restrict');

            $table->index(['reported_shop_ref_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('report_requests'); }
};
