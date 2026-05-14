# CynaSecure

Plateforme de cybersécurité full-stack composée d'un frontend Next.js, d'un backoffice react-admin, d'une application mobile Expo, d'un backend Symfony et d'une base de données MariaDB.

---

## Stack technique

| Couche | Technologie | Port |
|---|---|---|
| Frontend | Next.js 15 (TypeScript, Tailwind) | 3000 |
| Backoffice | Next.js 15 + react-admin | 3001 |
| Backend | Symfony 7 (PHP 8.3) | 8000 |
| Base de données | MariaDB 11 | 3306 |
| Administration DB | phpMyAdmin | 8080 |
| Mail (dev) | MailDev | 1080 |
| Mobile | Expo (React Native) | — |

---

## Prérequis

- [Node.js](https://nodejs.org) >= 18
- [PHP](https://www.php.net/downloads) >= 8.3
- [Composer](https://getcomposer.org)
- [Symfony CLI](https://symfony.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [XAMPP](https://www.apachefriends.org) (pour le développement local)
- [MailDev](https://github.com/maildev/maildev) — `npm install -g maildev`

---

## Structure du projet

```
cynasecure/
├── frontend/          # Next.js — application utilisateur
├── backoffice/        # Next.js + react-admin — administration
├── mobile/            # Expo — application mobile
├── backend/           # Symfony — API REST
├── database/
│   └── init.sql       # Script SQL d'initialisation
├── docker-compose.yml
└── .env
```

---

## Variables d'environnement

### Racine `.env` (Docker)
```env
DB_PASSWORD=root
DB_USER=root
DB_NAME=cynasecure
```

### `backend/.env` (local)
```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/cynasecure?serverVersion=8.0"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=
MAILER_DSN=smtp://127.0.0.1:1025
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### `mobile/.env`
```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

> Ne pas commiter `.env` en production.

---

## Lancement en local (développement)

> Lancer **XAMPP** (Apache + MySQL) avant tout.

Ouvrir **5 terminaux séparés** :

### Terminal 1 — Backend Symfony
```powershell
cd backend
symfony serve --allow-all-ip
```

### Terminal 2 — Frontend Next.js
```powershell
cd frontend
npm run dev
```

### Terminal 3 — Backoffice Next.js
```powershell
cd backoffice
npm run dev
```

### Terminal 4 — Mobile Expo
```powershell
cd mobile
npx expo start
```

### Terminal 5 — MailDev
```powershell
maildev
```

---

## Accès aux services (local)

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backoffice | http://localhost:3001 |
| Backend API | http://127.0.0.1:8000 |
| phpMyAdmin | http://localhost/phpmyadmin |
| MailDev | http://localhost:1080 |
| Mobile Expo | http://localhost:8081 |

---

## Lancement via Docker

```powershell
# Démarrer tous les services
docker compose up -d --build

# Voir les logs en temps réel
docker compose logs -f

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (reset DB)
docker compose down -v
```

### Accès aux services (Docker)

| Service | URL | Identifiants |
|---|---|---|
| Frontend | http://localhost:3000 | — |
| Backoffice | http://localhost:3001 | — |
| Backend API | http://localhost:8000 | — |
| phpMyAdmin | http://localhost:8080 | root / root |
| MailDev | http://localhost:1080 | — |

### Commandes Symfony dans Docker
```powershell
docker compose exec backend php bin/console doctrine:migrations:migrate
docker compose exec backend php bin/console cache:clear
```

---

## Base de données

Le fichier `database/init.sql` est exécuté automatiquement au premier démarrage du conteneur MariaDB.

Pour réinitialiser la base :
```powershell
docker compose down -v
docker compose up -d
```

---

## Fonctionnalités

- Authentification JWT (connexion / inscription)
- Réinitialisation de mot de passe par email
- Catalogue de produits
- Panier synchronisé avec le backend
- Interface d'administration (backoffice)
- Application mobile (Expo)

---

## Mobile (Expo)

Le projet mobile tourne en local, hors Docker :

```powershell
cd mobile
npx expo start
```

Scanner le QR code avec l'application **Expo Go** sur iOS ou Android.

> En développement local, utiliser l'IP de la machine à la place de `localhost` dans `mobile/.env`.

---

## Notes

- Le backend attend que MariaDB soit pleinement opérationnel avant de démarrer (healthcheck Docker).
- Les `node_modules` et `.next` sont exclus des bind-mounts Docker pour éviter les conflits.
- En production, remplacer `CMD ["npm", "run", "dev"]` par `CMD ["npm", "start"]` dans les Dockerfiles Next.js.