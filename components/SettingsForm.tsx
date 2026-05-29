"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";
import type { Profile } from "@/lib/types";

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      let newAvatar = avatarUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        newAvatar = data.publicUrl;
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          website: website.trim() || null,
          avatar_url: newAvatar,
        })
        .eq("id", profile.id);
      if (updErr) throw updErr;

      setAvatarUrl(newAvatar);
      setSaved(true);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <span className="relative">
          <Avatar
            src={preview ?? avatarUrl}
            name={displayName || profile.username}
            size={72}
          />
        </span>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium transition hover:border-ink"
          >
            Changer la photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={pickAvatar}
            className="hidden"
          />
          <p className="mt-1.5 font-mono text-xs text-subtle">@{profile.username}</p>
        </div>
      </div>

      {/* Champs */}
      <div className="mt-6 flex flex-col gap-5">
        <FieldArea label="Nom affiché">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Votre nom"
            className="w-full bg-transparent text-[15px] focus:outline-none"
          />
        </FieldArea>

        <FieldArea label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Parlez de vous et de votre rapport à l'IA…"
            className="w-full resize-none bg-transparent text-[15px] focus:outline-none"
          />
        </FieldArea>

        <FieldArea label="Site web">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="votresite.com"
            className="w-full bg-transparent text-[15px] focus:outline-none"
          />
        </FieldArea>
      </div>

      {error && <p className="mt-4 text-sm">⚠ {error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas transition hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && <span className="text-sm text-subtle">✓ Enregistré</span>}
      </div>
    </div>
  );
}

function FieldArea({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-xl border border-line px-4 py-2.5 transition focus-within:border-ink">
      <span className="block font-mono text-[11px] uppercase tracking-widest text-subtle">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
