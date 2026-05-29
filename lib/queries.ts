import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostWithAuthor, Profile, Comment, PostCategory } from "./types";

/* Sélection relationnelle commune : post + auteur + compteurs. */
const POST_SELECT = `
  id, user_id, content, media_url, media_type, category, created_at,
  author:profiles!posts_user_id_fkey ( id, username, display_name, bio, avatar_url, website, created_at ),
  likes:likes!likes_post_id_fkey ( count ),
  comments:comments!comments_post_id_fkey ( count )
`;

/** Transforme une ligne brute Supabase en PostWithAuthor enrichi. */
function hydrate(row: any, likedIds: Set<string>): PostWithAuthor {
  return {
    id: row.id,
    user_id: row.user_id,
    content: row.content,
    media_url: row.media_url,
    media_type: row.media_type,
    category: row.category,
    created_at: row.created_at,
    author: row.author as Profile,
    likes_count: row.likes?.[0]?.count ?? 0,
    comments_count: row.comments?.[0]?.count ?? 0,
    liked_by_me: likedIds.has(row.id),
  };
}

/** Récupère les ids des posts aimés par l'utilisateur courant. */
async function likedPostIds(
  supabase: SupabaseClient,
  userId: string | null,
): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.post_id));
}

/** Feed « Pour toi » — posts récents, tous auteurs confondus. */
export async function getFeed(
  supabase: SupabaseClient,
  currentUserId: string | null,
): Promise<PostWithAuthor[]> {
  const liked = await likedPostIds(supabase, currentUserId);
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row) => hydrate(row, liked));
}

/** Posts filtrés par catégorie (page Explorer). */
export async function getPostsByCategory(
  supabase: SupabaseClient,
  category: PostCategory,
  currentUserId: string | null,
): Promise<PostWithAuthor[]> {
  const liked = await likedPostIds(supabase, currentUserId);
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row) => hydrate(row, liked));
}

/** Profil par username. */
export async function getProfile(
  supabase: SupabaseClient,
  username: string,
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  return data ?? null;
}

/** Posts d'un utilisateur donné. */
export async function getPostsByUser(
  supabase: SupabaseClient,
  userId: string,
  currentUserId: string | null,
): Promise<PostWithAuthor[]> {
  const liked = await likedPostIds(supabase, currentUserId);
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((row) => hydrate(row, liked));
}

/** Un post unique. */
export async function getPost(
  supabase: SupabaseClient,
  id: string,
  currentUserId: string | null,
): Promise<PostWithAuthor | null> {
  const liked = await likedPostIds(supabase, currentUserId);
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return hydrate(data, liked);
}

/** Commentaires d'un post avec leurs auteurs. */
export async function getComments(
  supabase: SupabaseClient,
  postId: string,
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `id, post_id, user_id, content, created_at,
       author:profiles!comments_user_id_fkey ( id, username, display_name, bio, avatar_url, website, created_at )`,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as unknown as Comment[];
}

/** Compteurs d'un profil : posts, abonnés, abonnements. */
export async function getProfileStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ posts: number; followers: number; following: number }> {
  const [posts, followers, following] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return {
    posts: posts.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}
