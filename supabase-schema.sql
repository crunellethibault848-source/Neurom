-- =============================================
-- NEUROM - Schéma Supabase
-- Exécuter dans l'éditeur SQL de Supabase
-- =============================================

-- Extension pour UUID
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE: profiles
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  website text,
  expertise_level text default 'debutant' check (expertise_level in ('debutant', 'intermediaire', 'avance', 'expert', 'chercheur')),
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- TABLE: posts
-- =============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  media_urls text[],
  category text,
  tags text[],
  likes_count integer default 0,
  comments_count integer default 0,
  reposts_count integer default 0,
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- TABLE: comments
-- =============================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- =============================================
-- TABLE: likes
-- =============================================
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- =============================================
-- TABLE: follows
-- =============================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- =============================================
-- TABLE: notifications
-- =============================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('like', 'comment', 'follow', 'repost', 'mention')),
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- TABLE: bookmarks
-- =============================================
create table public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.bookmarks enable row level security;

-- Policies: profiles
create policy "Profiles visibles par tous" on public.profiles for select using (true);
create policy "Utilisateur peut modifier son profil" on public.profiles for update using (auth.uid() = id);

-- Policies: posts
create policy "Posts visibles par tous" on public.posts for select using (true);
create policy "Utilisateur peut créer un post" on public.posts for insert with check (auth.uid() = author_id);
create policy "Utilisateur peut modifier son post" on public.posts for update using (auth.uid() = author_id);
create policy "Utilisateur peut supprimer son post" on public.posts for delete using (auth.uid() = author_id);

-- Policies: comments
create policy "Commentaires visibles par tous" on public.comments for select using (true);
create policy "Utilisateur peut commenter" on public.comments for insert with check (auth.uid() = author_id);
create policy "Utilisateur peut supprimer son commentaire" on public.comments for delete using (auth.uid() = author_id);

-- Policies: likes
create policy "Likes visibles par tous" on public.likes for select using (true);
create policy "Utilisateur peut liker" on public.likes for insert with check (auth.uid() = user_id);
create policy "Utilisateur peut unliker" on public.likes for delete using (auth.uid() = user_id);

-- Policies: follows
create policy "Follows visibles par tous" on public.follows for select using (true);
create policy "Utilisateur peut suivre" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Utilisateur peut ne plus suivre" on public.follows for delete using (auth.uid() = follower_id);

-- Policies: notifications
create policy "Utilisateur voit ses notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Système peut créer des notifications" on public.notifications for insert with check (true);
create policy "Utilisateur peut marquer lu" on public.notifications for update using (auth.uid() = user_id);

-- Policies: bookmarks
create policy "Utilisateur voit ses bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Utilisateur peut bookmarker" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Utilisateur peut retirer bookmark" on public.bookmarks for delete using (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-créer un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Mettre à jour updated_at automatiquement
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.handle_updated_at();

-- Compteurs likes
create or replace function public.handle_like_insert()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_like_delete()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count - 1 where id = old.post_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_like_insert after insert on public.likes for each row execute procedure public.handle_like_insert();
create trigger on_like_delete after delete on public.likes for each row execute procedure public.handle_like_delete();

-- Compteurs follows
create or replace function public.handle_follow_insert()
returns trigger as $$
begin
  update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_follow_delete()
returns trigger as $$
begin
  update public.profiles set following_count = following_count - 1 where id = old.follower_id;
  update public.profiles set followers_count = followers_count - 1 where id = old.following_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_follow_insert after insert on public.follows for each row execute procedure public.handle_follow_insert();
create trigger on_follow_delete after delete on public.follows for each row execute procedure public.handle_follow_delete();

-- Compteur posts
create or replace function public.handle_post_insert()
returns trigger as $$
begin
  update public.profiles set posts_count = posts_count + 1 where id = new.author_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_post_delete()
returns trigger as $$
begin
  update public.profiles set posts_count = posts_count - 1 where id = old.author_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_post_insert after insert on public.posts for each row execute procedure public.handle_post_insert();
create trigger on_post_delete after delete on public.posts for each row execute procedure public.handle_post_delete();
