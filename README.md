# Cynasecure

> Plateforme e-commerce SaaS pour la commercialisation de solutions de cybersécurité d'entreprise (SOC, EDR, XDR, CSPM, Zero Trust, NDR).

Projet fil rouge B3 · H3 HITEMA · Promotion 2025-2026.

---

## Sommaire

1. [Aperçu](#aperçu)
2. [Fonctionnalités](#fonctionnalités)
3. [Stack technique](#stack-technique)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Lancement](#lancement)
8. [Tests](#tests)
9. [Architecture](#architecture)
10. [Sécurité](#sécurité)
11. [Internationalisation](#internationalisation)
12. [Accessibilité](#accessibilité)
13. [Captures d'écran](#captures-décran)
14. [Dépannage](#dépannage)
15. [Licence](#licence)

---

## Aperçu

Cynasecure est une plateforme web et back-office permettant à une entreprise spécialisée dans la cybersécurité de vendre ses services SaaS en ligne. La plateforme couvre l'intégralité du parcours client : navigation du catalogue, souscription d'abonnement, paiement sécurisé, gestion du compte et du cycle de vie des abonnements.

Le projet inclut également un back-office complet pour la gestion administrative (services, utilisateurs, abonnements, paiements, contenu de la page d'accueil, codes promotionnels, statistiques) ainsi qu'une intégration avec deux passerelles de paiement (Stripe et PayPal) en mode sandbox.

![Page d'accueil](Captures/home.png)

---

## Fonctionnalités

### Côté utilisateur

- **Catalogue** : recherche avancée avec 5 facettes (texte, prix, catégorie multi-sélection, disponibilité, type), tri par pertinence / prix / nouveauté, pagination.
- **Fiche service** : carrousel d'illustrations, caractéristiques techniques détaillées, CTA dynamique selon disponibilité, services similaires.
- **Panier** : ajout/retrait, durée d'abonnement (mensuel/annuel), application de codes promo, sauvegarde de session.
- **Tunnel de commande** : 4 étapes (authentification ou mode invité → adresse → paiement → confirmation), Stripe Elements + PayPal Buttons.
- **Compte** : profil, carnet d'adresses, méthodes de paiement enregistrées, gestion des abonnements (renouveler / changer de cycle / résilier), historique de commandes regroupé par année, téléchargement des factures PDF.
- **Sécurité** : inscription avec confirmation par e-mail (token 24 h), authentification à deux facteurs (TOTP), changement d'e-mail avec validation, politique de mot de passe forte, option « Se souvenir de moi ».
- **Contact** : formulaire avec persistance back-office et chatbot avec FAQ + escalade vers le support.

### Côté administrateur

- **Tableau de bord** : KPI (services, utilisateurs, abonnements actifs, MRR), trois graphiques (ventes par jour/semaine, paniers moyens par catégorie, répartition des ventes par catégorie).
- **Gestion** : services, catégories, utilisateurs, abonnements, paiements, contenu de la page d'accueil (carrousel, top produits, grille de catégories), codes promotionnels.
- **Modération** : messages de contact, conversations chatbot.
- **Sécurité** : authentification renforcée par 2FA obligatoire pour les comptes administrateurs.

### Transversal

- Site multilingue (français, anglais, espagnol) avec persistance du choix utilisateur.
- Détection automatique des transactions à risque via Stripe Radar et un système de scoring interne.
- Renouvellement automatique des abonnements via commande Symfony planifiable en cron.
- Webhooks Stripe et PayPal pour la synchronisation asynchrone des paiements.
- Conformité accessibilité WCAG 2.1 niveau AA (score Lighthouse 100/100 sur la page d'accueil).

---

## Stack technique

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square) | 18.3 | Bibliothèque UI |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square) | 5.8 | Typage statique |
| ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square) | 5.4 | Bundler / dev server |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) | 3.4 | Framework CSS |
| ![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white&style=flat-square) | 6.30 | Routage |
| ![i18next](https://img.shields.io/badge/i18next-26-26A69A?logo=i18next&logoColor=white&style=flat-square) | 26.3 | Internationalisation |
| ![Stripe](https://img.shields.io/badge/Stripe-JS-635BFF?logo=stripe&logoColor=white&style=flat-square) | 9.6 | Stripe Elements |
| ![PayPal](https://img.shields.io/badge/PayPal-SDK-00457C?logo=paypal&logoColor=white&style=flat-square) | 9.2 | Boutons PayPal |
| ![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?style=flat-square) | 2.15 | Graphiques admin |
| ![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white&style=flat-square) | 3.2 | Tests unitaires |

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| ![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white&style=flat-square) | 8.2+ | Langage |
| ![Symfony](https://img.shields.io/badge/Symfony-7.4-000000?logo=symfony&logoColor=white&style=flat-square) | 7.4 | Framework |
| ![Doctrine](https://img.shields.io/badge/Doctrine-ORM_3-FC6A31?logo=doctrine&logoColor=white&style=flat-square) | 3.6 | ORM |
| ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white&style=flat-square) | 8.0+ | Base de données |
| ![Stripe PHP](https://img.shields.io/badge/Stripe-PHP-635BFF?logo=stripe&logoColor=white&style=flat-square) | 20.1 | API Stripe |
| ![Dompdf](https://img.shields.io/badge/Dompdf-3-E10056?style=flat-square) | 3.1 | Génération PDF |
| Scheb 2FA Bundle | 7.13 | Authentification TOTP |

### Outillage

- Composer 2, npm 10
- Symfony CLI
- Git
- Stripe CLI (pour les webhooks en local)

---

## Prérequis

| Logiciel | Version minimale |
|---|---|
| PHP | 8.2 |
| Composer | 2.5 |
| Node.js | 20 LTS |
| npm | 10 |
| MySQL ou MariaDB | 8.0 / 10.6 |
| Symfony CLI | dernière |
| Stripe CLI | dernière (optionnel mais recommandé pour le développement) |

Extensions PHP requises : `ctype`, `iconv`, `pdo_mysql`, `mbstring`, `intl`, `openssl`, `xml`, `curl`.

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/<votre-organisation>/cynasecure.git
cd cynasecure
```

### 2. Installer le backend

```bash
cd backend
composer install
```

### 3. Installer le frontend

```bash
cd ../frontend
npm install
```

### 4. Préparer la base de données

```bash
cd ../backend
# Créer la base
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate --no-interaction
```

---

## Configuration

### Backend — `backend/.env.local`

À créer à partir du fichier `.env` fourni :

```dotenv
APP_ENV=dev
APP_SECRET=<chaîne_aléatoire_32_caractères>

DATABASE_URL="mysql://utilisateur:motdepasse@127.0.0.1:3306/cynasecure?serverVersion=8.0&charset=utf8mb4"

MAILER_DSN=null://null

# Stripe (mode test)
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CURRENCY=eur

# PayPal (mode sandbox)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx
PAYPAL_WEBHOOK_ID=
PAYPAL_CURRENCY=EUR

# URL frontend (pour les liens des e-mails)
FRONTEND_URL=http://localhost:5173
```

Les clés Stripe se récupèrent sur [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys).
Les identifiants PayPal sandbox se créent sur [developer.paypal.com](https://developer.paypal.com).

### Frontend — `frontend/.env.local`

```dotenv
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
VITE_PAYPAL_CLIENT_ID=xxxxx
```

Les deux fichiers `.env.local` sont déjà ignorés par Git.

---

## Lancement

Trois terminaux sont nécessaires en développement.

### Terminal 1 — Backend

```bash
cd backend
symfony serve
```

L'API est disponible sur `http://localhost:8000`.

### Terminal 2 — Webhook Stripe (optionnel)

```bash
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
```

La commande affiche un secret `whsec_...` à reporter dans `STRIPE_WEBHOOK_SECRET`.

### Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

Le site est disponible sur `http://localhost:5173`.

### Renouvellement automatique des abonnements (cron)

À planifier en production (exécution quotidienne) :

```bash
php bin/console app:subscriptions:renew
```

Exemple de tâche cron :

```cron
0 3 * * * cd /chemin/vers/cynasecure/backend && php bin/console app:subscriptions:renew
```

---

## Tests

### Frontend

```bash
cd frontend
npm run test
```

### Backend

```bash
cd backend
php bin/phpunit
```

### Audit accessibilité (manuel)

1. Ouvrir Chrome DevTools (`F12`).
2. Onglet **Lighthouse** → cocher **Accessibility** uniquement → mode **Mobile**.
3. Lancer l'audit sur les pages clés (`/`, `/catalogue`, `/services/1`, `/checkout`, `/contact`).

Le rapport courant est disponible dans `frontend/A11Y_LIGHTHOUSE_REPORT.md`.

---

## Architecture

### Vue d'ensemble

```
┌──────────────────────────┐
│       Navigateur         │
│  (React SPA + i18next)   │
└────────────┬─────────────┘
             │ HTTPS · cookies de session
             ▼
┌──────────────────────────┐         ┌──────────────────┐
│   API Symfony 7.4        │◄────────►│ Stripe / PayPal  │
│   (Doctrine ORM)         │         │  (webhooks)      │
└────────────┬─────────────┘         └──────────────────┘
             │
             ▼
┌──────────────────────────┐
│       MySQL 8.0          │
└──────────────────────────┘
```

### Arborescence

```
cynasecure/
├── backend/                 # Application Symfony
│   ├── config/              # Configuration (security, packages, routes)
│   ├── migrations/          # Migrations Doctrine versionnées
│   ├── public/              # Point d'entrée HTTP + uploads
│   ├── src/
│   │   ├── Command/         # Commandes CLI (ex. renouvellement)
│   │   ├── Controller/      # Contrôleurs HTTP (public + admin)
│   │   ├── Dto/             # Objets de transfert (SearchCriteria, ...)
│   │   ├── Entity/          # Entités Doctrine
│   │   ├── EventSubscriber/ # Subscribers (2FA admin, ...)
│   │   ├── Repository/      # Repositories Doctrine
│   │   ├── Security/        # Handlers d'authentification, 2FA
│   │   ├── Service/         # Services métier
│   │   └── Validator/       # Contraintes personnalisées
│   └── templates/           # Templates Twig (e-mails, factures PDF)
│
├── frontend/                # Application React
│   ├── public/              # Assets statiques
│   └── src/
│       ├── api/             # Clients HTTP par domaine
│       ├── components/      # Composants partagés (UI, layout, shared)
│       ├── context/         # Contexts React (Auth, Cart)
│       ├── hooks/           # Hooks personnalisés
│       ├── i18n/            # Configuration i18next + locales JSON
│       ├── lib/             # Utilitaires (utils, serviceImages)
│       ├── pages/           # Pages par feature
│       └── router/          # Configuration du routage
│
├── Captures/                # Captures d'écran de l'application
├── MOBILE_APP_GUIDE.md      # Guide de démarrage app mobile React Native
└── README.md
```

---

## Sécurité

| Mesure | Implémentation |
|---|---|
| Authentification | Sessions Symfony (cookie `PHPSESSID`, HttpOnly, SameSite=Lax) |
| 2FA administrateur | TOTP via `scheb/2fa-bundle` (Google Authenticator, Authy) |
| Confirmation d'e-mail | Token aléatoire (32 octets) hashé SHA-256, validité 24 h |
| Politique mot de passe | 8 caractères minimum, majuscule, minuscule, chiffre, caractère spécial |
| Hachage mot de passe | Argon2id (paramètres par défaut Symfony) |
| Protection paiement | Stripe Elements + 3D Secure / SCA automatique en Europe |
| Détection fraude | Stripe Radar + scoring interne (IP, fréquence, email jetable) |
| Webhooks | Vérification de signature Stripe et PayPal côté serveur |
| Données bancaires | Aucune donnée carte stockée (uniquement Stripe `payment_method_id`) |
| Protection CSRF | Tokens CSRF Symfony sur les formulaires sensibles |
| Rate limiting | Endpoints sensibles (`/api/auth/*`, `/api/cart/promo`, webhooks) |
| HTTPS | Obligatoire en production |

---

## Internationalisation

Trois langues supportées :

- **Français** (défaut)
- **Anglais**
- **Espagnol**

Le back-office reste en français comme autorisé par le cahier des charges. Le sélecteur de langue est accessible depuis le menu de navigation. Le choix est persisté en `localStorage`.

Fichiers de traduction : `frontend/src/i18n/locales/{fr,en,es}.json`.

---

## Accessibilité

Le site respecte la norme **WCAG 2.1 niveau AA**.

- Score **Lighthouse Accessibility : 100/100** sur la page d'accueil.
- Skip-link clavier en début de page.
- Navigation complète au clavier (Tab, Shift+Tab, Enter, Esc).
- Focus visible sur tous les éléments interactifs (anneau bleu).
- Focus trap sur les widgets modaux (chatbot).
- `aria-label` traduits sur tous les boutons icône.
- Contrastes textuels supérieurs à 4.5:1 sur fond sombre.
- Zones tactiles ≥ 44×44 px sur les contrôles de carrousel.
- Annonces dynamiques via `aria-live` sur les toasts et messages d'erreur.

Rapport détaillé : `frontend/A11Y_LIGHTHOUSE_REPORT.md`.

---

## Captures d'écran

### Page d'accueil

![Accueil](Captures/home.png)

### Catalogue

![Catalogue](Captures/catalogue.png)

### Panier

![Panier](Captures/cart.png)

### Tunnel de paiement

![Checkout](Captures/checkout.png)

### Tableau de bord utilisateur

![Dashboard utilisateur](Captures/dash_user.png)

### Profil

![Profil](Captures/profil.png)

### Contact

![Contact](Captures/contact.png)

### Tableau de bord administrateur

![Dashboard admin](Captures/dash_admin.png)

---

## Dépannage

### La migration Doctrine échoue

Vérifier que la base existe et que les paramètres `DATABASE_URL` sont corrects. Pour repartir d'une base propre :

```bash
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction
```

### Stripe : erreur `No signature provided`

Le secret `STRIPE_WEBHOOK_SECRET` est manquant ou expiré. Relancer `stripe listen` et copier le `whsec_...` affiché dans `backend/.env.local`.

### PayPal : le popup ne s'ouvre pas

Vérifier que `VITE_PAYPAL_CLIENT_ID` est bien défini côté frontend et que le mode `sandbox` est actif côté backend.

### Le frontend ne contacte pas le backend

L'API doit autoriser l'origine du frontend. Vérifier `backend/config/packages/nelmio_cors.yaml` et la variable d'environnement `CORS_ALLOW_ORIGIN`.

### Les e-mails ne partent pas

En développement, `MAILER_DSN=null://null` empêche l'envoi réel. Les e-mails sont visibles dans le profiler Symfony (toolbar) ou en passant à `MAILER_DSN=smtp://localhost:1025` avec un serveur de test (MailHog, Mailpit).

---

## Licence

Projet académique réalisé dans le cadre du projet fil rouge CYNA .
Tout droit réservé. Code propriétaire — usage pédagogique exclusivement.

---

## Auteurs

Équipe projet fil rouge CYNA — 2025-2026 .
