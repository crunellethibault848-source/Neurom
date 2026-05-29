"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";
import { HeartIcon, CommentIcon, ShareIcon } from "./icons";
import { CATEGORY_LABELS, type PostWithAuthor } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId: string | null;
  /** Si vrai, cliquer la carte ouvre le détail du post. */
  clickable?: boolean;
}

export function PostCard({ post, currentUserId, clickable = true }: PostCardProps) {
  const router = useRouter();
  const supabase = createClient();

  const [liked, setLiked] = useState(post.liked_by_me);
  const [likes, setLikes] = useState(post.likes_count);
  const [busy, setBusy] = useState(false);

  const authorName = post.author.display_name ?? post.author.username;

  async function toggleLike(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUserId || busy) return;
    setBusy(true);

    // Optimiste
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));

    try {
      if (next) {
        await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId });
      } else {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
      }
    } catch {
      // rollback en cas d'erreur
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  async function share(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Neurom", url });
      } catch {
        /* annulé */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  function openComments(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/post/${post.id}`);
  }

  const Wrapper = clickable ? Link : "div";
  const wrapperProps = clickable ? { href: `/post/${post.id}` } : {};

  return (
    // @ts-expect-error — union Link/div
    <Wrapper
      {...wrapperProps}
      className="block border-b border-line px-4 py-3 transition hover:bg-elevated/50"
    >
      <article className="flex gap-3">
        <Link
          href={`/profile/${post.author.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <Avatar src={post.author.avatar_url} name={authorName} size={44} />
        </Link>

        <div className="min-w-0 flex-1">
          {/* En-tête */}
          <div className="flex items-center gap-1.5 text-[15px]">
            <Link
              href={`/profile/${post.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate font-semibold hover:underline"
            >
              {authorName}
            </Link>
            <span className="truncate text-subtle">@{post.author.username}</span>
            <span className="text-subtle">·</span>
            <time className="shrink-0 text-subtle" dateTime={post.created_at}>
              {timeAgo(post.created_at)}
            </time>
            {post.category !== "general" && (
              <span className="ml-auto shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                {CATEGORY_LABELS[post.category]}
              </span>
            )}
          </div>

          {/* Contenu */}
          {post.content && (
            <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-normal">
              {post.content}
            </p>
          )}

          {/* Média */}
          {post.media_url && (
            <div className="mt-2.5 overflow-hidden rounded-2xl border border-line">
              {post.media_type === "video" ? (
                <video
                  src={post.media_url}
                  controls
                  className="max-h-[510px] w-full bg-black"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.media_url}
                  alt=""
                  className="max-h-[510px] w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-2.5 flex items-center gap-1 text-muted">
            <button
              onClick={openComments}
              className="group flex items-center gap-1.5 rounded-full py-1 pr-3 transition hover:text-ink"
            >
              <span className="rounded-full p-1.5 transition group-hover:bg-elevated">
                <CommentIcon />
              </span>
              <span className="font-mono text-xs tabular-nums">
                {post.comments_count || ""}
              </span>
            </button>

            <button
              onClick={toggleLike}
              className={cn(
                "group flex items-center gap-1.5 rounded-full py-1 pr-3 transition",
                liked ? "text-ink" : "hover:text-ink",
              )}
              aria-pressed={liked}
            >
              <span className="rounded-full p-1.5 transition group-hover:bg-elevated">
                <HeartIcon filled={liked} />
              </span>
              <span className="font-mono text-xs tabular-nums">
                {likes || ""}
              </span>
            </button>

            <button
              onClick={share}
              className="group ml-auto flex items-center rounded-full transition hover:text-ink"
              aria-label="Partager"
            >
              <span className="rounded-full p-1.5 transition group-hover:bg-elevated">
                <ShareIcon />
              </span>
            </button>
          </div>
        </div>
      </article>
    </Wrapper>
  );
}
