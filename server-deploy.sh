#!/bin/bash

# Автоматический скрипт развертывания TermoStick на сервере
# Сервер: 72.62.3.23
# Домен: termostick.uz
# Дата создания: $(date +%Y-%m-%d)

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════════"
echo "    🚀 АВТОМАТИЧЕСКОЕ РАЗВЕРТЫВАНИЕ TERMOSTICK"
echo "════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Функции для вывода
success() { echo -e "${GREEN}✓ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; exit 1; }
info() { echo -e "${BLUE}ℹ $1${NC}"; }

# Конфигурация
DOMAIN="termostick.uz"
WWW_DOMAIN="www.termostick.uz"
INSTALL_DIR="/var/www/termostick"
NGINX_AVAILABLE="/etc/nginx/sites-available/termostick"
NGINX_ENABLED="/etc/nginx/sites-enabled/termostick"

echo ""
info "Проверка системных требований..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
  error "Этот скрипт должен быть запущен с правами root (используйте sudo)"
fi
success "Права root подтверждены"

# Обновление системы
echo ""
info "Обновление системы..."
apt update -qq
apt upgrade -y -qq
success "Система обновлена"

# Установка необходимых пакетов
echo ""
info "Установка необходимых пакетов..."
apt install -y nginx certbot python3-certbot-nginx ufw -qq
success "Пакеты установлены: Nginx, Certbot, UFW"

# Настройка firewall
echo ""
info "Настройка Firewall (UFW)..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force reload
success "Firewall настроен"

# Создание директории для сайта
echo ""
info "Создание директории для сайта..."
mkdir -p $INSTALL_DIR
success "Директория создана: $INSTALL_DIR"

# Проверка наличия архива
if [ ! -f "termostik-dist.tar.gz" ]; then
    error "Файл termostik-dist.tar.gz не найден! Загрузите его в текущую директорию."
fi

# Распаковка архива
echo ""
info "Распаковка файлов приложения..."
tar -xzf termostik-dist.tar.gz -C $INSTALL_DIR --strip-components=1
success "Файлы распакованы в $INSTALL_DIR"

# Установка прав доступа
echo ""
info "Настройка прав доступа..."
chown -R www-data:www-data $INSTALL_DIR
chmod -R 755 $INSTALL_DIR
success "Права доступа настроены"

# Создание конфигурации Nginx
echo ""
info "Создание конфигурации Nginx..."
cat > $NGINX_AVAILABLE << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name termostick.uz www.termostick.uz;

    root /var/www/termostick;
    index index.html;

    # Логи
    access_log /var/log/nginx/termostick-access.log;
    error_log /var/log/nginx/termostick-error.log;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;
    gzip_disable "msie6";

    # Кэширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Кэширование HTML
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Скрыть версию Nginx
    server_tokens off;

    # Ограничение размера файлов
    client_max_body_size 10M;
}
EOF
success "Конфигурация Nginx создана"

# Активация конфигурации Nginx
echo ""
info "Активация конфигурации Nginx..."
ln -sf $NGINX_AVAILABLE $NGINX_ENABLED
success "Конфигурация активирована"

# Тестирование конфигурации Nginx
echo ""
info "Проверка конфигурации Nginx..."
nginx -t || error "Ошибка в конфигурации Nginx!"
success "Конфигурация Nginx корректна"

# Перезапуск Nginx
echo ""
info "Перезапуск Nginx..."
systemctl restart nginx
systemctl enable nginx
success "Nginx перезапущен и добавлен в автозагрузку"

# Проверка статуса Nginx
if systemctl is-active --quiet nginx; then
    success "Nginx работает"
else
    error "Nginx не запущен!"
fi

# Финальное сообщение
echo ""
echo -e "${GREEN}"
echo "════════════════════════════════════════════════════════════"
echo "    ✅ БАЗОВОЕ РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО УСПЕШНО!"
echo "════════════════════════════════════════════════════════════"
echo -e "${NC}"

echo ""
echo -e "${YELLOW}📋 СЛЕДУЮЩИЕ ШАГИ:${NC}"
echo ""
echo "1. Убедитесь, что DNS настроен:"
echo "   - A-запись: termostick.uz → 72.62.3.23"
echo "   - A-запись: www.termostick.uz → 72.62.3.23"
echo ""
echo "2. После настройки DNS, установите SSL сертификат:"
echo -e "   ${BLUE}sudo certbot --nginx -d termostick.uz -d www.termostick.uz${NC}"
echo ""
echo "3. Проверьте сайт в браузере:"
echo "   - http://termostick.uz (временно, до настройки DNS)"
echo "   - http://72.62.3.23 (прямой доступ по IP)"
echo ""
echo "4. После установки SSL, сайт будет доступен по HTTPS:"
echo "   - https://termostick.uz"
echo ""
echo -e "${YELLOW}📊 СТАТУС СЕРВИСОВ:${NC}"
systemctl status nginx --no-pager -l | head -5
echo ""

echo -e "${GREEN}🎉 Развертывание завершено!${NC}"
echo ""
