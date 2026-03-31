<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. roles
        Schema::create('roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50)->comment('ชื่อ Role เช่น USER, ADMIN');
            $table->text('description')->nullable();
        });

        // 2. fraud_types
        Schema::create('fraud_types', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100)->comment('ชื่อประเภทการโกง เช่น ส่งของไม่ตรงปก');
            $table->text('description')->nullable()->comment('คำอธิบายเพิ่มเติม');
            $table->boolean('is_active')->default(true);
        });

        // 3. accounts
       Schema::create('accounts', function (Blueprint $table) {
    // ปรับจาก 24 เป็น 26 เพื่อรองรับ ULID ของจริง
    $table->string('id', 26)->primary(); 
    
    $table->unsignedInteger('role_id')->default(1);
    $table->string('email', 255)->unique();
    
    // ตั้งชื่อให้สื่อสารง่าย หรือใช้ password ตามมาตรฐาน Laravel ก็ได้
    $table->string('password_hash', 255)->nullable(); 
    
    // สำคัญมากสำหรับ Google Login
    $table->string('google_id', 255)->nullable()->unique(); 
    
    $table->boolean('is_email_verified')->default(false);
    $table->string('display_name', 255)->nullable();
    $table->text('avatar_url')->nullable();
    $table->string('phone_number', 20)->nullable();
    $table->boolean('is_company')->default(false);
    $table->boolean('is_active')->default(true);
    $table->dateTime('last_login')->nullable();
    $table->timestamps();

    $table->foreign('role_id')->references('id')->on('roles')->restrictOnDelete();
});
        // 4. bookbanks
        Schema::create('bookbanks', function (Blueprint $table) {
            $table->increments('id');
            $table->string('account_id', 24);
            $table->string('bank_name', 50);
            $table->string('bank_branch_code', 10)->nullable();
            $table->string('bank_account_holder_name', 255);
            $table->string('bank_account_number', 20);
            $table->text('bank_image_url')->nullable();
            $table->timestamps();

            $table->foreign('account_id')->references('id')->on('accounts')->cascadeOnDelete();
        });

        // 5. shops
        Schema::create('shops', function (Blueprint $table) {
            $table->string('ref_id', 50)->primary();
            $table->string('name', 255);
            $table->string('channel', 50)->nullable();
            $table->string('owner_account_id', 26)->nullable();
            $table->text('url')->nullable();
            $table->string('current_tier', 50)->default('TIER_1')->comment('ระดับขั้นปัจจุบันของร้านค้า');
            $table->boolean('is_active')->default(true)->comment('TRUE = เปิดอยู่, FALSE = ปิดร้านแล้ว');
            $table->integer('failed_upgrade_count')->default(0)->comment('นับจำนวนครั้งที่ขอเลื่อนขั้นแล้วถูกปฏิเสธ');
            $table->boolean('is_blacklist')->default(false);
            $table->timestamps();
            $table->softDeletes(); // สำหรับ deleted_at

            $table->foreign('owner_account_id')->references('id')->on('accounts')->cascadeOnDelete();
        });

        // 6. admin_action_logs
        Schema::create('admin_action_logs', function (Blueprint $table) {
            $table->id(); // BIGINT AUTO_INCREMENT
            $table->string('admin_id', 24)->comment('รหัสของแอดมินที่เป็นคนกดทำรายการ');
            $table->string('action_type', 50)->comment('ประเภทการกระทำ');
            $table->string('target_type', 50)->comment('ตารางที่ถูกกระทำ');
            $table->string('target_id', 50)->comment('ID ของเป้าหมาย');
            $table->json('details')->nullable()->comment('เก็บข้อมูลเพิ่มเติมแบบยืดหยุ่น');
            $table->string('ip_address', 45)->nullable()->comment('เก็บ IP ของแอดมิน');
            $table->dateTime('created_at')->useCurrent(); // ไม่มี updated_at

            $table->index(['target_type', 'target_id']);
            $table->foreign('admin_id')->references('id')->on('accounts')->restrictOnDelete();
        });

        // 7. upgrade_requests
        Schema::create('upgrade_requests', function (Blueprint $table) {
            $table->increments('id');
            $table->string('shop_ref_id', 50);
            $table->string('status', 20)->default('pending');
            $table->text('admin_remark')->nullable();
            $table->timestamps();

            $table->foreign('shop_ref_id')->references('ref_id')->on('shops')->cascadeOnDelete();
        });

        // 8. claim_requests
        Schema::create('claim_requests', function (Blueprint $table) {
            $table->increments('id');
            $table->string('claimer_account_id', 24);
            $table->string('shop_ref_id', 50);
            $table->unsignedInteger('fraud_type_id');
            $table->text('reason')->comment('รายละเอียดหรือเหตุผลที่โดนโกง');
            $table->string('contact_info', 255)->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();

            $table->foreign('claimer_account_id')->references('id')->on('accounts')->cascadeOnDelete();
            $table->foreign('shop_ref_id')->references('ref_id')->on('shops')->cascadeOnDelete();
            $table->foreign('fraud_type_id')->references('id')->on('fraud_types')->restrictOnDelete();
        });

        // 9. blacklists
        Schema::create('blacklists', function (Blueprint $table) {
            $table->increments('id');
            $table->string('shop_ref_id', 50);
            $table->string('admin_account_id', 24);
            $table->unsignedInteger('claim_request_id')->nullable()->comment('ใบเคลมฟางเส้นสุดท้าย');
            $table->text('reason');
            $table->dateTime('created_at')->useCurrent(); // ไม่มี updated_at

            $table->foreign('shop_ref_id')->references('ref_id')->on('shops')->cascadeOnDelete();
            $table->foreign('admin_account_id')->references('id')->on('accounts')->restrictOnDelete();
            $table->foreign('claim_request_id')->references('id')->on('claim_requests')->nullOnDelete();
        });

        // 10. attachments
        Schema::create('attachments', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('upgrade_request_id')->nullable();
            $table->unsignedInteger('claim_request_id')->nullable();
            $table->text('file_url');
            $table->dateTime('created_at')->useCurrent(); // ไม่มี updated_at

            $table->foreign('upgrade_request_id')->references('id')->on('upgrade_requests')->cascadeOnDelete();
            $table->foreign('claim_request_id')->references('id')->on('claim_requests')->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('blacklists');
        Schema::dropIfExists('claim_requests');
        Schema::dropIfExists('upgrade_requests');
        Schema::dropIfExists('admin_action_logs');
        Schema::dropIfExists('shops');
        Schema::dropIfExists('bookbanks');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('fraud_types');
        Schema::dropIfExists('roles');
    }
};