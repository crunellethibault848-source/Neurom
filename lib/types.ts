/**
 * Types du domaine Neurom — reflètent le schéma SQL Supabase.
 */

export type PostCategory = "general" | "decouverte" | "actu" | "bon_plan" | "outil";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  category: PostCategory;
  created_at: string;
}

/** Post enrichi avec les infos d'auteur + compteurs (issu de la vue/jointure). */
export interface PostWithAuthor extends Post {
  author: Profile;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: Profile;
}

/** Libellés FR des catégories, affichés dans l'UI. */
export const CATEGORY_LABELS: Record<PostCategory, string> = {
  general: "Général",
  decouverte: "Découverte",
  actu: "Actu IA",
  bon_plan: "Bon plan",
  outil: "Outil",
};
