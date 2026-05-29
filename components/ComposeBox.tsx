"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";
import { ImageIcon, VideoIcon, CloseIcon } from "./icons";
import { CATEGORY_LABELS, type PostCategory, type Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_CHARS = 500;
const CATEGORIES = Object.keys(CATEGORY_LABELS) as PostCategory[];

interface ComposeBoxProps {
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  autoFocus?: boolean;
  onPosted?: () => void;
}

export function ComposeBox({ profile, autoFocus, onPosted }: ComposeBoxProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_CHARS - content.length;
  const isVideo = file?.type.startsWith("video");
  const canPost = (content.trim().length > 0 || !!file) && !submitting && remaining >= 0;

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      setError("Fichier trop volumineux (50 Mo max).");
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (!canPost) return;
    setSubmitting(true);
    setError(null);

    try {
      let media_url: string | null = null;
      let media_type: "image" | "video" | null = null;

      // 1) Upload du média vers le bucket "media" si présent.
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${profile.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;

        const { data } = supabase.storage.from("media").getPublicUrl(path);
        media_url = data.publicUrl;
        media_type = file.type.startsWith("video") ? "video" : "image";
      }

      // 2) Insertion du post.
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: profile.id,
        content: content.trim() || null,
        media_url,
        media_type,
        category,
      });
      if (insErr) throw insErr;

      // 3) Reset + rafraîchissement du feed.
      setContent("");
      setCategory("general");
      clearFile();
      onPosted?.();
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Échec de la publication.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar
        src={profile.avatar_url}
        name={profile.display_name ?? profile.username}
        size={44}
      />

      <div className="min-w-0 flex-1">
        <textarea
          autoFocus={autoFocus}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Une découverte, une actu, un bon plan IA ?"
          rows={2}
          className="w-full resize-none bg-transparent pt-2 text-lg leading-snug placeholder:text-subtle focus:outline-none"
        />

        {/* Aperçu média */}
        {previewUrl && (
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-line">
            <button
              onClick={clearFile}
              className="absolute right-2 top-2 z-10 rounded-full bg-ink/80 p-1.5 text-canvas backdrop-blur transition hover:bg-ink"
              aria-label="Retirer le média"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            {isVideo ? (
              <video src={previewUrl} controls className="max-h-[420px] w-full bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="aperçu" className="max-h-[420px] w-full object-cover" />
            )}
          </div>
        )}

        {/* Sélecteur de catégorie */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide transition",
                category === cat
                  ? "border-ink bg-ink text-canvas"
                  : "border-line text-muted hover:border-ink hover:text-ink",
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {error && <p className="mt-2 text-sm text-ink">⚠ {error}</p>}

        {/* Barre d'actions */}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <div className="flex items-center gap-1 text-ink">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full p-2 transition hover:bg-elevated"
              aria-label="Ajouter une image"
            >
              <ImageIcon />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full p-2 transition hover:bg-elevated"
              aria-label="Ajouter une vidéo"
            >
              <VideoIcon />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={pickFile}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  remaining < 0 ? "text-ink" : "text-subtle",
                )}
              >
                {remaining}
              </span>
            )}
            <button
              onClick={submit}
              disabled={!canPost}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas transition hover:opacity-90 active:scale-95 disabled:opacity-30"
            >
              {submitting ? "Publication…" : "Publier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
