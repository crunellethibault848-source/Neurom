"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ExploreIcon, UserIcon, PlusIcon } from "./icons";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface MobileNavProps {
  profile: Pick<Profile, "username"> | null;
  onCompose?: () => void;
}

/** Barre fixe en bas, visible uniquement sur mobile. */
export function MobileNav({ profile, onCompose }: MobileNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Accueil", Icon: HomeIcon },
    { href: "/explore", label: "Explorer", Icon: ExploreIcon },
    {
      href: profile ? `/profile/${profile.username}` : "/settings",
      label: "Profil",
      Icon: UserIcon,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-canvas/90 px-2 py-2 backdrop-blur-md sm:hidden">
      {links.map(({ href, label, Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            aria-label={label}
            className={cn(
              "flex flex-1 items-center justify-center rounded-full py-2 transition",
              active ? "text-ink" : "text-subtle",
            )}
          >
            <Icon className="h-[26px] w-[26px]" filled={active} />
          </Link>
        );
      })}
      <button
        onClick={onCompose}
        aria-label="Publier"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-canvas transition active:scale-95"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </nav>
  );
}
