FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN a2enmod rewrite

RUN mkdir -p /var/www/html/uploads && chmod -R 777 /var/www/html/uploads