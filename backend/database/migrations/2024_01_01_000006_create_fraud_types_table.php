<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fraud_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('เช่น สินค้าไม่ตรงรูป, โกงเงิน');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
        });
    }
    public function down(): void { Schema::dropIfExists('fraud_types'); }
};
