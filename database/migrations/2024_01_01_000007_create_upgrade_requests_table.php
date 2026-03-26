<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('upgrade_requests', function (Blueprint $table) {
            $table->id();
            $table->string('shop_ref_id', 50);
            $table->string('status', 20)->default('pending')
                ->comment('pending|approved|rejected|cancelled');
            $table->text('admin_remark')->nullable();
            $table->timestamps();

            $table->foreign('shop_ref_id')
                ->references('ref_id')->on('shops')
                ->onDelete('cascade');

            $table->index(['shop_ref_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('upgrade_requests'); }
};
