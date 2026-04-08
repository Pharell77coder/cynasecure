Set-Location $PSScriptRoot

function Write-F {
    param([string]$p, [string]$c)
    $d = Split-Path $p -Parent
    if ($d -and -not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot $p), $c, [System.Text.UTF8Encoding]::new($false))
}

Write-F ".env" "DB_PASSWORD=root`nDB_USER=root`nDB_NAME=cynasecure"

if (-not (Test-Path "frontend")) {
    npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
}
Push-Location frontend
npm install
Pop-Location

Write-F "frontend/Dockerfile" "FROM node:20-alpine`nWORKDIR /app`nCOPY package*.json ./`nRUN npm install`nCOPY . .`nENV HOSTNAME=0.0.0.0`nENV PORT=3000`nEXPOSE 3000`nCMD [""npm"", ""run"", ""dev""]"
Write-F "frontend/.dockerignore" "node_modules`n.next`n.git"

if (-not (Test-Path "mobile")) {
    npx create-expo-app@latest mobile --template blank-typescript
}
Push-Location mobile
npm install
Pop-Location

if (-not (Test-Path "backend")) {
    symfony new backend --webapp
}
Push-Location backend
composer install --no-interaction
Pop-Location

Write-F "backend/Dockerfile" "FROM php:8.4-cli`nRUN apt-get update && apt-get install -y git curl zip unzip libonig-dev libxml2-dev && docker-php-ext-install pdo pdo_mysql mbstring xml && apt-get clean && rm -rf /var/lib/apt/lists/*`nCOPY --from=composer:latest /usr/bin/composer /usr/bin/composer`nWORKDIR /var/www/backend`nCOPY . .`nRUN composer install --no-interaction --prefer-dist --optimize-autoloader`nEXPOSE 8000`nCMD [""php"", ""-S"", ""0.0.0.0:8000"", ""-t"", ""public""]"
Write-F "backend/.dockerignore" "vendor`n.git`nvar/cache`nvar/log"

if (-not (Test-Path "backoffice")) {
    npx create-next-app@latest backoffice --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
}
Push-Location backoffice
npm install
npm install react-admin ra-data-simple-rest
Pop-Location

Write-F "backoffice/Dockerfile" "FROM node:20-alpine`nWORKDIR /app`nCOPY package*.json ./`nRUN npm install`nCOPY . .`nENV HOSTNAME=0.0.0.0`nENV PORT=3001`nEXPOSE 3001`nCMD [""npm"", ""run"", ""dev""]"
Write-F "backoffice/.dockerignore" "node_modules`n.next`n.git"

if (-not (Test-Path "database")) { New-Item -ItemType Directory -Path "database" | Out-Null }
Write-F "database/init.sql" "CREATE DATABASE IF NOT EXISTS cynasecure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`nUSE cynasecure;"

$compose = 'version: "3.9"

networks:
  cynasecure_net:
    driver: bridge

volumes:
  db_data:

services:

  db:
      image: mariadb:11
      restart: unless-stopped
      environment:
        MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
        MYSQL_DATABASE: cynasecure
        MYSQL_USER: ${DB_USER}
        MYSQL_PASSWORD: ${DB_PASSWORD}
      volumes:
        - db_data:/var/lib/mysql
        - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      networks:
        - cynasecure_net
      healthcheck:
        test: ["CMD", "mariadb-admin", "ping", "-h", "localhost", "-uroot", "-p${DB_PASSWORD}"]
        interval: 10s
        timeout: 5s
        retries: 10
        start_period: 30s

  phpmyadmin:
    image: phpmyadmin:latest
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      PMA_HOST: db
      PMA_USER: root
      PMA_PASSWORD: ${DB_PASSWORD}
    ports:
      - "8080:80"
    networks:
      - cynasecure_net

  backend:
    build: ./backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: "mysql://root:${DB_PASSWORD}@db:3306/cynasecure?serverVersion=mariadb-11.0.0"
      APP_ENV: dev
      APP_SECRET: changeme_secret_32chars_minimum
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/var/www/backend
    networks:
      - cynasecure_net

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    networks:
      - cynasecure_net
    environment:
      HOSTNAME: "0.0.0.0"
      TURBOPACK_WATCH_FOR_FS_EVENTS: "0"
      NEXT_PUBLIC_API_URL: http://localhost:8000

  backoffice:
    build: ./backoffice
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./backoffice:/app
      - /app/node_modules
      - /app/.next
    networks:
      - cynasecure_net
    environment:
      HOSTNAME: "0.0.0.0"
      TURBOPACK_WATCH_FOR_FS_EVENTS: "0"
      NEXT_PUBLIC_API_URL: http://localhost:8000'

Write-F "docker-compose.yml" $compose

docker compose up -d --build

Write-Host "Frontend   : http://localhost:3000"
Write-Host "Backoffice : http://localhost:3001"
Write-Host "Backend    : http://localhost:8000"
Write-Host "phpMyAdmin : http://localhost:8080"
Write-Host "Mobile     : cd mobile puis npx expo start"