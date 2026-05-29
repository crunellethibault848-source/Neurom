"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: PostCategory[] = ["actu", "decouverte", "outil", "bon_plan", "general"];

export function CategoryTabs() {
  const params = useSearchParams();
  const active = (params.get("cat") as PostCategory) ?? "actu";

  return (
    <div className="sticky top-[57px] z-20 flex overflow-x-auto border-b border-line bg-canvas/80 backdrop-blur-md">
      {TABS.map((cat) => {
        const isActive = active === cat;
        return (
          <Link
            key={cat}
            href={`/explore?cat=${cat}`}
            className={cn(
              "relative whitespace-nowrap px-5 py-3.5 text-[15px] transition hover:bg-elevated",
              isActive ? "font-semibold text-ink" : "text-muted",
            )}
          >
            {CATEGORY_LABELS[cat]}
            {isActive && (
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-ink" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
