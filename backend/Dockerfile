FROM php:8.2-apache

# ติดตั้ง extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install mysqli pdo pdo_mysql gd zip \
    && a2enmod rewrite

# ติดตั้ง Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ก๊อปปี้โค้ด Laravel
COPY . /var/www/html/

# ตั้งค่า document root
RUN sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# สร้างโฟลเดอร์ที่จำเป็น
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/html/bootstrap/cache

# ตั้งค่า permission
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

WORKDIR /var/www/html

EXPOSE 80

# ไม่ต้องติดตั้ง dependencies ที่นี่
CMD ["apache2-foreground"]