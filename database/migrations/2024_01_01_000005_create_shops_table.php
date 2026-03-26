<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->string('ref_id', 50)->primary();
            $table->string('name', 255);
            $table->string('channel', 50)->nullable();
            $table->string('owner_account_id', 26)->nullable();
            $table->text('url')->nullable();
            $table->string('shop_status', 20)->default('NORMAL')
                ->comment('NORMAL=ขั้น1, TIER2=ขั้น2, TIER3=ขั้น3, BLACKLIST=ถูกแบน');
            $table->boolean('is_active')->default(true)
                ->comment('true=เปิด, false=ปิดร้าน');
            $table->integer('failed_upgrade_count')->default(0)
                ->comment('จำนวนครั้งที่ขอเลื่อนขั้นแล้วถูกปฏิเสธ');
            $table->boolean('is_blacklist')->nullable()->default(false);
            $table->boolean('is_deleted')->nullable()->default(false);
            $table->timestamps();

            $table->foreign('owner_account_id')
                ->references('id')->on('accounts')
                ->onDelete('cascade');

            $table->index(['shop_status', 'is_deleted', 'is_active']);
            $table->index('is_blacklist');
        });
    }
    public function down(): void { Schema::dropIfExists('shops'); }
};
