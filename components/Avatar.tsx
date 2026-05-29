import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

/** Avatar circulaire : image si dispo, sinon initiale sur fond encre. */
export function Avatar({ src, name, size = 44, className }: AvatarProps) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-canvas",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? "avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-mono font-medium leading-none"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
    </span>
  );
}
