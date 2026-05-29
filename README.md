# neurom

**Le réseau social entièrement dédié à l'IA.** Partage de découvertes, actu, bons plans et outils — dans un fil « Pour toi », avec photos et vidéos. Design minimaliste noir & blanc.

Stack : **Next.js 14** (App Router) · **Supabase** (auth, Postgres, Storage) · **Tailwind CSS** · déployable sur **Vercel**.

> Le projet est livré **vierge et fonctionnel** : aucun faux post. Tout se remplit dès que vous publiez.

---

## 1. Lancer en local

```bash
npm install
cp .env.local.example .env.local   # puis remplissez vos clés (étape 3)
npm run dev
```

Ouvrez http://localhost:3000.

---

## 2. Pousser sur GitHub

```bash
git init
git add .
git commit -m "neurom — version initiale"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/neurom.git
git push -u origin main
```

> `.env.local` est ignoré par git : vos clés ne seront **jamais** publiées. ✅

---

## 3. Configurer Supabase

1. Créez un projet sur https://supabase.com.
2. **SQL Editor → New query** : collez tout le contenu de [`supabase/schema.sql`](supabase/schema.sql) et cliquez **Run**.
   → Crée les tables, la sécurité (RLS), le trigger de création de profil et le bucket de stockage `media`.
3. **Settings → API** : copiez `Project URL` et la clé `anon public`.
4. Renseignez votre `.env.local` :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. **Authentication → Providers → Email** : pour tester sans confirmation, désactivez *« Confirm email »* (optionnel, pratique en dev).
6. **Authentication → URL Configuration** : ajoutez vos URLs de redirection :
   `http://localhost:3000/**` et `https://votre-domaine.vercel.app/**`.

---

## 4. Déployer sur Vercel

1. https://vercel.com → **Add New → Project** → importez votre repo GitHub.
2. Framework détecté automatiquement : **Next.js**. Rien à configurer côté build.
3. **Environment Variables** : ajoutez les 3 variables ci-dessus
   (mettez `NEXT_PUBLIC_SITE_URL` = l'URL Vercel de production).
4. **Deploy**. C'est en ligne.

> Après le premier déploiement, pensez à ajouter l'URL Vercel dans
> Supabase → Authentication → URL Configuration.

---

## Structure

```
app/
  page.tsx                  Fil « Pour toi »
  explore/                  Exploration par catégorie (actu, bons plans…)
  profile/[username]/       Profil public + posts
  post/[id]/                Détail d'un post + commentaires
  settings/                 Édition du profil
  (auth)/login · signup     Authentification
  auth/callback             Callback de session
components/                 UI (Sidebar, PostCard, ComposeBox, modal…)
lib/
  supabase/                 Clients navigateur / serveur / middleware
  queries.ts                Requêtes (feed, profil, post…)
  types.ts · utils.ts · auth.ts
supabase/schema.sql         Base de données complète
middleware.ts               Protection des routes + session
```

## Fonctionnalités

- Inscription / connexion par e-mail (Supabase Auth)
- Publication de posts : texte + image ou vidéo, classés par catégorie
- Fil « Pour toi », exploration par thème
- Likes, commentaires, partage
- Profils publics, abonnements (suivre / ne plus suivre)
- Édition de profil (nom, bio, site, avatar)
- Responsive, thème clair **et** sombre automatique
- Sécurité au niveau des lignes (RLS) : chacun n'écrit que ses propres données

## Personnalisation rapide

- **Couleurs / thème** : variables CSS dans `app/globals.css` (`--ink`, `--canvas`…).
- **Catégories** : `lib/types.ts` (objet `CATEGORY_LABELS`) + la contrainte `check` dans `supabase/schema.sql`.
- **Police** : Geist (sans + mono). Remplaçable dans `app/layout.tsx`.

---

Construit pour être étendu. Bon build 🖤🤍
