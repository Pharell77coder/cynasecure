# CynaSecure

Plateforme de cybersécurité full-stack composée d'un frontend Next.js, d'un backoffice react-admin, d'une application mobile Expo, d'un backend Symfony et d'une base de données MariaDB orchestrés via Docker.

---

## Stack technique

| Couche | Technologie | Port |
|---|---|---|
| Frontend | Next.js 14 (TypeScript, Tailwind) | 3000 |
| Backoffice | Next.js 14 + react-admin | 3001 |
| Backend | Symfony 7 (PHP 8.3) | 8000 |
| Base de données | MariaDB 11 | 3306 |
| Administration DB | phpMyAdmin | 8080 |
| Mobile | Expo (React Native) | — |

---

## Prérequis

- [Node.js](https://nodejs.org) >= 18
- [PHP](https://www.php.net/downloads) >= 8.3
- [Composer](https://getcomposer.org)
- [Symfony CLI](https://symfony.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## Installation

Placer `setup.ps1` à la racine du projet puis exécuter dans PowerShell :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

Le script installe tous les services, génère les Dockerfiles, le `docker-compose.yml` et lance les conteneurs.

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
├── .env
└── setup.ps1
```

---

## Variables d'environnement

Le fichier `.env` est créé automatiquement à la racine :

```env
DB_PASSWORD=root
DB_USER=root
DB_NAME=cynasecure
```

> Ne pas commiter `.env` en production. Modifier les valeurs avant tout déploiement.

---

## Commandes Docker

```bash
# Démarrer tous les services
docker compose up -d --build

# Voir les logs en temps réel
docker compose logs -f

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (reset DB)
docker compose down -v
```

---

## Accès aux services

| Service | URL | Identifiants |
|---|---|---|
| Frontend | http://localhost:3000 | — |
| Backoffice | http://localhost:3001 | — |
| Backend API | http://localhost:8000 | — |
| phpMyAdmin | http://localhost:8080 | root / root |

---

## Mobile (Expo)

Le projet mobile tourne en local, hors Docker :

```bash
cd mobile
npx expo start
```

Scanner le QR code avec l'application **Expo Go** sur iOS ou Android.

---

## Développement

### Frontend & Backoffice

Les dossiers `frontend/` et `backoffice/` sont montés en volume dans Docker. Toute modification est reflétée immédiatement grâce au hot-reload de Next.js.

### Backend Symfony

Le dossier `backend/` est également monté en volume. Pour exécuter des commandes Symfony dans le conteneur :

```bash
docker compose exec backend php bin/console <commande>

# Exemples
docker compose exec backend php bin/console doctrine:migrations:migrate
docker compose exec backend php bin/console cache:clear
```

### Base de données

Le fichier `database/init.sql` est exécuté automatiquement au premier démarrage du conteneur MariaDB. Pour ajouter des tables ou des données initiales, modifier ce fichier puis relancer avec :

```bash
docker compose down -v
docker compose up -d
```

---

## Notes

- Le backend attend que MariaDB soit pleinement opérationnel avant de démarrer (healthcheck).
- Les `node_modules` et `.next` sont exclus des bind-mounts pour éviter les conflits entre l'hôte et le conteneur.
- En production, remplacer `CMD ["npm", "run", "dev"]` par `CMD ["npm", "run", "build"]` + `CMD ["npm", "start"]` dans les Dockerfiles Next.js.