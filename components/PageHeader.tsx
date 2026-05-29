"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

/** Bandeau supérieur translucide façon X, sticky en haut de la colonne centrale. */
export function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-md">
      {back && (
        <button
          onClick={() => router.back()}
          aria-label="Retour"
          className="-ml-2 rounded-full p-2 transition hover:bg-elevated"
        >
          <BackIcon />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[19px] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[13px] text-subtle">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}
