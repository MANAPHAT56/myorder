<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('upgrade_request_id')->nullable();
            $table->unsignedBigInteger('report_request_id')->nullable();
            $table->unsignedBigInteger('claim_request_id')->nullable();
            $table->text('file_url')->comment('path ใน storage หรือ S3 key');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('upgrade_request_id')
                ->references('id')->on('upgrade_requests')->onDelete('cascade');
            $table->foreign('report_request_id')
                ->references('id')->on('report_requests')->onDelete('cascade');
            $table->foreign('claim_request_id')
                ->references('id')->on('claim_requests')->onDelete('cascade');
        });
    }
    public function down(): void { Schema::dropIfExists('attachments'); }
};
