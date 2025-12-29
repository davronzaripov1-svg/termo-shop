# 🚀 ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ TERMOSTICK

## Информация о сервере

- **IP адрес:** 72.62.3.23
- **Домен:** termostick.uz
- **SSH:** root@72.62.3.23 (порт 22)
- **ОС:** Ubuntu Linux
- **Путь установки:** /var/www/termostick

---

## ШАГ 1: НАСТРОЙКА DNS (ОБЯЗАТЕЛЬНО!)

Перед развертыванием настройте DNS записи у вашего регистратора доменов:

### Зайдите в панель управления доменом termostick.uz

Добавьте следующие A-записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A | @ | 72.62.3.23 | 3600 |
| A | www | 72.62.3.23 | 3600 |

### Проверка DNS

После настройки подождите 5-10 минут и проверьте:

```bash
# На вашем компьютере
nslookup termostick.uz
nslookup www.termostick.uz

# Должны вернуть IP: 72.62.3.23
```

Или онлайн: https://www.whatsmydns.net/

---

## ШАГ 2: ЗАГРУЗКА ФАЙЛОВ НА СЕРВЕР

### Вариант A: Использование SCP (Windows/Linux/Mac)

На вашем локальном компьютере выполните:

```bash
# Перейдите в папку проекта
cd "D:\githab tokin\PythonProject\termostik\termostik2"

# Загрузите архив на сервер
scp -P 22 termostik-dist.tar.gz root@72.62.3.23:/root/

# Загрузите скрипт развертывания
scp -P 22 server-deploy.sh root@72.62.3.23:/root/
```

### Вариант B: Использование WinSCP (Windows)

1. Скачайте WinSCP: https://winscp.net/
2. Подключитесь к серверу:
   - Протокол: SFTP
   - Хост: 72.62.3.23
   - Порт: 22
   - Имя пользователя: root
   - Пароль: Davron7331634-
3. Загрузите файлы:
   - `termostik-dist.tar.gz`
   - `server-deploy.sh`

   В папку `/root/`

### Вариант C: Использование FileZilla (Windows/Linux/Mac)

1. Скачайте FileZilla: https://filezilla-project.org/
2. Настройте подключение:
   - Хост: sftp://72.62.3.23
   - Имя пользователя: root
   - Пароль: Davron7331634-
   - Порт: 22
3. Загрузите файлы в `/root/`

---

## ШАГ 3: ПОДКЛЮЧЕНИЕ К СЕРВЕРУ

### Windows (PowerShell или CMD)

```powershell
ssh root@72.62.3.23
# Введите пароль: Davron7331634-
```

### Windows (PuTTY)

1. Скачайте PuTTY: https://www.putty.org/
2. Настройки:
   - Host Name: 72.62.3.23
   - Port: 22
   - Connection type: SSH
3. Нажмите "Open"
4. Войдите:
   - login as: root
   - password: Davron7331634-

### Linux/Mac (Terminal)

```bash
ssh root@72.62.3.23
# Введите пароль: Davron7331634-
```

---

## ШАГ 4: ЗАПУСК АВТОМАТИЧЕСКОГО РАЗВЕРТЫВАНИЯ

После подключения к серверу выполните:

```bash
# Проверьте, что файлы загружены
ls -lh /root/

# Должны увидеть:
# termostik-dist.tar.gz
# server-deploy.sh

# Сделайте скрипт исполняемым
chmod +x /root/server-deploy.sh

# Запустите автоматическое развертывание
cd /root
sudo ./server-deploy.sh
```

### Что делает скрипт?

1. ✅ Обновляет систему
2. ✅ Устанавливает Nginx, Certbot, UFW
3. ✅ Настраивает Firewall
4. ✅ Создает директорию /var/www/termostick
5. ✅ Распаковывает файлы сайта
6. ✅ Настраивает Nginx конфигурацию
7. ✅ Запускает Nginx

### Время выполнения: 3-5 минут

---

## ШАГ 5: УСТАНОВКА SSL СЕРТИФИКАТА

После того как DNS настроен и распространился (проверьте nslookup), установите SSL:

```bash
# На сервере выполните:
sudo certbot --nginx -d termostick.uz -d www.termostick.uz

# Следуйте инструкциям:
# 1. Введите email: rewq_12345@mail.ru
# 2. Согласитесь с условиями (Y)
# 3. Выберите: Redirect HTTP to HTTPS (рекомендуется)
```

Сертификат будет обновляться автоматически каждые 90 дней.

---

## ШАГ 6: ПРОВЕРКА РАБОТЫ САЙТА

### Проверка по IP (сразу после развертывания)

Откройте в браузере:
- http://72.62.3.23

### Проверка по домену (после настройки DNS)

Откройте в браузере:
- http://termostick.uz
- http://www.termostick.uz

### Проверка HTTPS (после установки SSL)

Откройте в браузере:
- https://termostick.uz
- https://www.termostick.uz

### Проверка PWA

1. Откройте сайт в Chrome/Edge
2. В адресной строке должна появиться кнопка "Установить"
3. Нажмите установить
4. PWA приложение установится на устройство

---

## ПОЛЕЗНЫЕ КОМАНДЫ

### Проверка статуса Nginx

```bash
sudo systemctl status nginx
```

### Перезапуск Nginx

```bash
sudo systemctl restart nginx
```

### Просмотр логов

```bash
# Логи доступа
sudo tail -f /var/log/nginx/termostick-access.log

# Логи ошибок
sudo tail -f /var/log/nginx/termostik-error.log
```

### Проверка конфигурации Nginx

```bash
sudo nginx -t
```

### Просмотр статуса Certbot

```bash
sudo certbot certificates
```

### Обновление сайта в будущем

```bash
# 1. Загрузите новый termostik-dist.tar.gz на сервер

# 2. Распакуйте
cd /root
sudo tar -xzf termostik-dist.tar.gz -C /var/www/termostick --strip-components=1

# 3. Установите права
sudo chown -R www-data:www-data /var/www/termostick
sudo chmod -R 755 /var/www/termostick

# 4. Перезапустите Nginx
sudo systemctl reload nginx
```

---

## РЕШЕНИЕ ПРОБЛЕМ

### Проблема: Сайт не открывается по домену

**Решение:**
1. Проверьте DNS: `nslookup termostick.uz`
2. Подождите 10-30 минут для распространения DNS
3. Очистите кэш DNS на компьютере:
   - Windows: `ipconfig /flushdns`
   - Linux/Mac: `sudo systemd-resolve --flush-caches`

### Проблема: Ошибка 502 Bad Gateway

**Решение:**
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Проблема: Ошибка SSL при установке сертификата

**Решение:**
1. Убедитесь, что DNS настроен и работает
2. Проверьте, что порты 80 и 443 открыты:
   ```bash
   sudo ufw status
   ```

### Проблема: Файлы не загружаются на сервер

**Решение:**
1. Проверьте SSH подключение
2. Убедитесь, что используете правильный пароль
3. Попробуйте другой метод загрузки (WinSCP/FileZilla)

---

## КОНТАКТЫ ПОДДЕРЖКИ

- Email: rewq_12345@mail.ru
- Telegram: https://t.me/Termostik
- Телефон: +998331233217

---

## ЧЕКЛИСТ РАЗВЕРТЫВАНИЯ

- [ ] DNS настроен (A-записи для @ и www)
- [ ] DNS распространился (проверка nslookup)
- [ ] Файлы загружены на сервер (termostik-dist.tar.gz, server-deploy.sh)
- [ ] SSH подключение к серверу работает
- [ ] Скрипт server-deploy.sh выполнен успешно
- [ ] Nginx запущен и работает
- [ ] Сайт открывается по IP (http://72.62.3.23)
- [ ] Сайт открывается по домену (http://termostick.uz)
- [ ] SSL сертификат установлен
- [ ] Сайт работает по HTTPS (https://termostick.uz)
- [ ] PWA устанавливается в браузере
- [ ] Все страницы работают (/catalog, /calculator, /cart, /profile)

---

## СЛЕДУЮЩИЕ ШАГИ (ОПЦИОНАЛЬНО)

1. **Настройка Google Analytics**
   - Получите Tracking ID
   - Добавьте в .env файл
   - Пересоберите и переразверните

2. **Настройка Yandex Metrika**
   - Получите Metrika ID
   - Добавьте в .env файл
   - Пересоберите и переразверните

3. **Настройка резервного копирования**
   ```bash
   # Создание backup
   sudo tar -czf /root/backup-$(date +%Y%m%d).tar.gz /var/www/termostick
   ```

4. **Мониторинг сервера**
   - Установите uptimerobot.com для мониторинга аптайма
   - Настройте уведомления на email

---

🎉 **Развертывание завершено! Ваш сайт готов к работе!**
