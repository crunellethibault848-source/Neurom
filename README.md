# 🧠 Neurom — Réseau Social IA

La communauté française de l'intelligence artificielle.

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js 18+
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit)

### 2. Installation locale

```bash
# Cloner le repo (après l'avoir créé sur GitHub)
git clone https://github.com/TON_USERNAME/neurom.git
cd neurom

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Édite .env.local avec tes clés Supabase
```

### 3. Configuration Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Va dans **SQL Editor** et exécute le fichier `supabase-schema.sql`
3. Va dans **Settings > API** et copie :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Configure l'authentification :
   - **Authentication > Providers** : active Email et GitHub (optionnel)
   - **Authentication > URL Configuration** :
     - Site URL : `http://localhost:3000` (dev) / ton domaine Vercel (prod)
     - Redirect URLs : ajoute `https://ton-projet.vercel.app/**`

### 4. Lancer en local

```bash
npm run dev
# Ouvre http://localhost:3000
```

### 5. Déployer sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Ou directement via le dashboard Vercel en connectant ton repo GitHub
```

**Variables d'environnement sur Vercel :**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 Structure du projet

```
neurom/
├── src/
│   ├── pages/              # Pages Next.js (routing automatique)
│   │   ├── index.tsx       # Page connexion/inscription
│   │   ├── feed.tsx        # Fil d'actualité principal
│   │   ├── explore.tsx     # Explorer profils et publications
│   │   ├── notifications.tsx
│   │   ├── bookmarks.tsx
│   │   ├── settings.tsx
│   │   ├── reset-password.tsx
│   │   ├── 404.tsx
│   │   └── profile/
│   │       └── [username].tsx  # Profil utilisateur dynamique
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx   # Sidebar + layout principal
│   │   ├── feed/
│   │   │   ├── PostCard.tsx    # Carte publication
│   │   │   └── ComposePost.tsx # Composer une publication
│   │   └── ui/
│   │       └── RightPanel.tsx  # Tendances + suggestions
│   ├── hooks/
│   │   └── useAuth.tsx     # Context auth + profil
│   ├── lib/
│   │   └── supabase.ts     # Client Supabase + types
│   └── styles/
│       └── globals.css
├── supabase-schema.sql     # Schéma BDD complet
├── .env.local.example      # Template variables d'env
└── tailwind.config.js
```

## 🎨 Design System

- **Couleur principale** : `#4DFFC3` (vert néon)
- **Fond** : `#080A0F` (noir profond)
- **Typographie** : Syne (display) + DM Sans (corps)
- **Style** : Dark mode, épuré, style X/Twitter

## 🗄️ Base de données

Tables principales :
- `profiles` — profils utilisateurs (lié à auth.users)
- `posts` — publications
- `comments` — commentaires
- `likes` — likes (many-to-many)
- `follows` — abonnements (many-to-many)
- `notifications` — système de notifications
- `bookmarks` — publications sauvegardées

Les compteurs (likes, follows, posts) sont mis à jour automatiquement via des triggers SQL.

## 🔧 Prochaines fonctionnalités

- [ ] Commentaires sur les posts
- [ ] Mode sombre/clair
- [ ] Upload d'images (Supabase Storage)
- [ ] Recherche full-text
- [ ] Notifications push
- [ ] Fil abonnements (home)
- [ ] Messages privés
- [ ] Partage de snippets de code
- [ ] Intégration agrégateur news IA

## 📄 License

MIT — Libre d'utilisation et modification.
