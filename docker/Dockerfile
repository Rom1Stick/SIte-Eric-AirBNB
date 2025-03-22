FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
    libpng-dev \
    zlib1g-dev \
    libxml2-dev \
    libzip-dev \
    libonig-dev \
    zip \
    curl \
    unzip \
    && docker-php-ext-configure gd \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-install mysqli \
    && docker-php-ext-install zip \
    && docker-php-source delete

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Active le module rewrite et headers d'Apache
RUN a2enmod rewrite headers

# Configure Apache pour servir correctement les types MIME
RUN echo "AddType text/css .css" >> /etc/apache2/apache2.conf
RUN echo "AddType application/javascript .js" >> /etc/apache2/apache2.conf
RUN echo "EnableSendfile off" >> /etc/apache2/apache2.conf
RUN sed -i 's/LogLevel warn/LogLevel debug/' /etc/apache2/apache2.conf

WORKDIR /var/www/html
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
CMD ["apache2-foreground"] 