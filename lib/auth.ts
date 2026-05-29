import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "./types";

/**
 * Renvoie le profil de l'utilisateur connecté, ou null.
 * À appeler depuis les Server Components.
 */
export async function getCurrentProfile(
  supabase: SupabaseClient,
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}
