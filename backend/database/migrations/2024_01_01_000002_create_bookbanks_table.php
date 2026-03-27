<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookbanks', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name', 50);
            $table->string('bank_branch_code', 10)->nullable();
            $table->string('bank_account_holder_name', 255);
            $table->string('bank_account_number', 20);
            $table->text('bank_image_url')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bookbanks'); }
};
