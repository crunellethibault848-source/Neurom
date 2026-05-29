"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NeuromLogo, NeuromMark } from "./Logo";
import { Avatar } from "./Avatar";
import {
  HomeIcon,
  ExploreIcon,
  UserIcon,
  SettingsIcon,
  PlusIcon,
  LogoutIcon,
} from "./icons";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface SidebarProps {
  profile: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
  onCompose?: () => void;
}

export function Sidebar({ profile, onCompose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links = [
    { href: "/", label: "Accueil", Icon: HomeIcon },
    { href: "/explore", label: "Explorer", Icon: ExploreIcon },
    {
      href: profile ? `/profile/${profile.username}` : "/settings",
      label: "Profil",
      Icon: UserIcon,
    },
    { href: "/settings", label: "Réglages", Icon: SettingsIcon },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen flex-col justify-between px-2 py-3 sm:flex sm:w-[88px] xl:w-[260px] xl:px-4">
      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="mb-2 flex h-12 items-center rounded-full px-3 transition hover:bg-elevated"
          aria-label="Neurom — accueil"
        >
          <span className="xl:hidden">
            <NeuromMark className="h-8 w-8" />
          </span>
          <span className="hidden xl:inline-flex">
            <NeuromLogo />
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "group flex items-center gap-4 rounded-full px-3 py-2.5 text-[17px] transition hover:bg-elevated xl:pr-6",
                  active ? "font-semibold" : "font-normal text-muted hover:text-ink",
                )}
              >
                <Icon className="h-[26px] w-[26px]" filled={active} />
                <span className="hidden xl:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={onCompose}
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-4 font-medium text-canvas transition hover:opacity-90 active:scale-[0.98] xl:w-full"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden xl:inline">Publier</span>
        </button>
      </div>

      {/* Bloc utilisateur en bas */}
      {profile && (
        <div className="group relative">
          <button className="flex w-full items-center gap-3 rounded-full p-2 text-left transition hover:bg-elevated">
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name ?? profile.username}
              size={40}
            />
            <span className="hidden min-w-0 flex-1 flex-col xl:flex">
              <span className="truncate text-[15px] font-medium leading-tight">
                {profile.display_name ?? profile.username}
              </span>
              <span className="truncate text-sm text-subtle">
                @{profile.username}
              </span>
            </span>
            <button
              onClick={handleLogout}
              aria-label="Se déconnecter"
              className="hidden rounded-full p-2 text-subtle transition hover:bg-canvas hover:text-ink xl:block"
            >
              <LogoutIcon className="h-[18px] w-[18px]" />
            </button>
          </button>
          {/* Déconnexion accessible aussi en mode réduit */}
          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="absolute -top-12 left-1/2 hidden -translate-x-1/2 rounded-full border border-line bg-canvas p-2.5 shadow-sm group-hover:block xl:hidden"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      )}
    </aside>
  );
}
