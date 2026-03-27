<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->string('id', 26)->primary();               // ULID
            $table->unsignedBigInteger('role_id')->default(1); // 1=USER, 2=ADMIN
            $table->unsignedBigInteger('bookbank_id')->nullable();
            $table->string('email', 255)->unique();
            $table->string('google_id', 255)->nullable()->unique();
            $table->boolean('is_email_verified')->default(false);
            $table->string('display_name', 255)->nullable();
            $table->text('avatar_url')->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->boolean('is_company')->default(false);
            $table->boolean('is_active')->default(true);
            $table->dateTime('last_login')->nullable();

            $table->foreign('role_id')
                ->references('id')->on('roles')
                ->onDelete('restrict');

            $table->foreign('bookbank_id')
                ->references('id')->on('bookbanks')
                ->onDelete('set null');
        });
    }
    public function down(): void { Schema::dropIfExists('accounts'); }
};
