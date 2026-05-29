import { NeuromMark } from "./Logo";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <div className="relative mb-6">
        <NeuromMark className="h-12 w-12 text-line" />
        <span className="absolute -inset-3 -z-10 rounded-full border border-line/60" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
