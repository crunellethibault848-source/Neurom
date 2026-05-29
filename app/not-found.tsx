import Link from "next/link";
import { NeuromMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <NeuromMark className="h-14 w-14 text-line" />
      <div>
        <h1 className="font-mono text-5xl font-medium tracking-tightest">404</h1>
        <p className="mt-2 text-muted">Cette page n&apos;existe pas (encore).</p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas transition hover:opacity-90"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
