FROM php:8.4-cli
RUN apt-get update && apt-get install -y git curl zip unzip libonig-dev libxml2-dev && docker-php-ext-install pdo pdo_mysql mbstring xml && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/backend
COPY . .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader
EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]