# ใช้ PHP เวอร์ชั่นที่มี Apache มาให้
FROM php:8.2-apache

# 1. เปลี่ยน DocumentRoot ของ Apache ให้ชี้ไปที่โฟลเดอร์ /public ของ Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 👇 2. [ส่วนที่เพิ่มใหม่] บังคับให้ Apache อนุญาตการทำงานของไฟล์ .htaccess
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 3. เปิดใช้งาน mod_rewrite (สำคัญมาก! สำหรับ Route ของ Laravel)
RUN a2enmod rewrite

# 4. ติดตั้ง Extension ของ PHP ที่จำเป็นสำหรับ Laravel และ Database
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip

# ตั้งค่า Working Directory
WORKDIR /var/www/html