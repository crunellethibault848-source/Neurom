"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";
import { EmptyState } from "./EmptyState";
import { timeAgo } from "@/lib/utils";
import type { Comment, Profile } from "@/lib/types";

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
}

export function CommentSection({
  postId,
  initialComments,
  profile,
}: CommentSectionProps) {
  const router = useRouter();
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!profile || !text.trim() || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: postId, user_id: profile.id, content: text.trim() })
        .select("id, post_id, user_id, content, created_at")
        .single();
      if (error) throw error;

      // On reconstruit le commentaire enrichi côté client.
      const newComment: Comment = {
        ...(data as Omit<Comment, "author">),
        author: {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: null,
          website: null,
          created_at: new Date().toISOString(),
        },
      };
      setComments((c) => [...c, newComment]);
      setText("");
      router.refresh();
    } catch {
      /* silencieux pour l'UX ; à logger côté prod */
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      {/* Saisie */}
      {profile && (
        <div className="flex gap-3 border-b border-line px-4 py-3">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name ?? profile.username}
            size={40}
          />
          <div className="flex flex-1 flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Répondre…"
              rows={1}
              className="w-full resize-none bg-transparent pt-2 text-[15px] placeholder:text-subtle focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={!text.trim() || busy}
              className="self-end rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-canvas transition hover:opacity-90 active:scale-95 disabled:opacity-30"
            >
              Répondre
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {comments.length === 0 ? (
        <EmptyState
          title="Aucune réponse"
          description="Soyez la première personne à réagir à ce post."
        />
      ) : (
        <ul className="flex flex-col">
          {comments.map((c) => {
            const name = c.author?.display_name ?? c.author?.username ?? "?";
            return (
              <li key={c.id} className="flex gap-3 border-b border-line px-4 py-3">
                <Link href={`/profile/${c.author?.username}`} className="shrink-0">
                  <Avatar src={c.author?.avatar_url} name={name} size={40} />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[15px]">
                    <Link
                      href={`/profile/${c.author?.username}`}
                      className="truncate font-semibold hover:underline"
                    >
                      {name}
                    </Link>
                    <span className="truncate text-subtle">
                      @{c.author?.username}
                    </span>
                    <span className="text-subtle">·</span>
                    <time className="shrink-0 text-subtle">{timeAgo(c.created_at)}</time>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-normal">
                    {c.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
