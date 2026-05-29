import { SearchIcon } from "./icons";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/types";
import Link from "next/link";

const TOPICS: PostCategory[] = ["actu", "decouverte", "outil", "bon_plan"];

/** Colonne de droite : recherche et raccourcis thématiques. Données réelles à venir. */
export function RightPanel() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[330px] shrink-0 flex-col gap-5 px-6 py-4 lg:flex">
      {/* Recherche (UI ; logique à brancher côté client) */}
      <div className="flex items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2.5 text-muted focus-within:border-ink focus-within:text-ink">
        <SearchIcon />
        <input
          type="search"
          placeholder="Rechercher sur Neurom"
          className="w-full bg-transparent text-[15px] text-ink placeholder:text-subtle focus:outline-none"
        />
      </div>

      {/* Thématiques */}
      <div className="rounded-2xl border border-line">
        <h2 className="px-5 pb-2 pt-4 text-[19px] font-semibold tracking-tight">
          Explorer par thème
        </h2>
        <div className="flex flex-col">
          {TOPICS.map((cat) => (
            <Link
              key={cat}
              href={`/explore?cat=${cat}`}
              className="flex items-center justify-between px-5 py-3 transition hover:bg-elevated"
            >
              <span>
                <span className="block font-mono text-xs uppercase tracking-wider text-subtle">
                  #{cat}
                </span>
                <span className="text-[15px] font-medium">
                  {CATEGORY_LABELS[cat]}
                </span>
              </span>
              <span className="text-subtle">›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pied de page sobre */}
      <footer className="px-2 text-xs leading-relaxed text-subtle">
        <p className="font-mono">neurom — réseau dédié à l&apos;IA</p>
        <p className="mt-1">
          Conditions · Confidentialité · À propos · © {new Date().getFullYear()}
        </p>
      </footer>
    </aside>
  );
}
