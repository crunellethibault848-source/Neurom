"use client";

import { useEffect } from "react";
import { ComposeBox } from "./ComposeBox";
import { CloseIcon } from "./icons";
import type { Profile } from "@/lib/types";

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
}

export function ComposeModal({ open, onClose, profile }: ComposeModalProps) {
  // Verrouille le scroll + ferme sur Échap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-4 backdrop-blur-sm sm:pt-20 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-canvas shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-elevated"
            aria-label="Fermer"
          >
            <CloseIcon />
          </button>
          <span className="font-mono text-xs uppercase tracking-widest text-subtle">
            Nouvelle publication
          </span>
          <span className="w-9" />
        </div>
        <ComposeBox profile={profile} autoFocus onPosted={onClose} />
      </div>
    </div>
  );
}
