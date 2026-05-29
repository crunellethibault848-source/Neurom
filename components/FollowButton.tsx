"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string | null;
  initiallyFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initiallyFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);

  // Pas de bouton sur son propre profil ou si déconnecté.
  if (!currentUserId || currentUserId === targetUserId) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
      } else {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
      }
      router.refresh();
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={busy}
      className={cn(
        "h-9 rounded-full border px-5 text-sm font-semibold transition active:scale-95",
        following
          ? "border-line text-ink hover:border-ink"
          : "border-ink bg-ink text-canvas hover:opacity-90",
      )}
    >
      {following ? (hover ? "Ne plus suivre" : "Suivi") : "Suivre"}
    </button>
  );
}
