FROM php:8.2-apache

# Cài đặt extension kết nối MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Bật mod_rewrite của Apache (rất quan trọng cho API)
RUN a2enmod rewrite

# Cấp quyền cho thư mục uploads (nếu có tính năng up ảnh)
RUN mkdir -p /var/www/html/uploads && chmod -R 777 /var/www/html/uploads