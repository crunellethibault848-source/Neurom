"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { RightPanel } from "./RightPanel";
import { ComposeModal } from "./ComposeModal";
import type { Profile } from "@/lib/types";

interface AppShellProps {
  profile: Profile | null;
  children: React.ReactNode;
  /** Masque la colonne de droite (ex. pages plein écran). */
  hideRightPanel?: boolean;
}

/**
 * Coquille principale : 3 colonnes façon X.
 * Centre la timeline, gère le modal de publication global.
 */
export function AppShell({ profile, children, hideRightPanel }: AppShellProps) {
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1290px] justify-center">
      <Sidebar profile={profile} onCompose={() => setComposeOpen(true)} />

      <main className="min-h-screen w-full max-w-[600px] flex-1 border-x border-line pb-20 sm:pb-0">
        {children}
      </main>

      {!hideRightPanel && <RightPanel />}

      <MobileNav profile={profile} onCompose={() => setComposeOpen(true)} />

      {profile && (
        <ComposeModal
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          profile={profile}
        />
      )}
    </div>
  );
}
