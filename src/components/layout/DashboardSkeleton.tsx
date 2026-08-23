import { useReducedMotion } from "@/hooks/useReducedMotion";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-muted/30 ${className || ""}`}>
      <div className="skeleton-shimmer h-full w-full rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  const reduced = useReducedMotion();

  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading dashboard"
      style={{ opacity: reduced ? 1 : undefined }}
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-64" />
        <SkeletonBlock className="h-4 w-80" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Content panels skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock className="h-64 rounded-xl" />
        <SkeletonBlock className="h-64 rounded-xl" />
      </div>

      {/* Quick actions skeleton */}
      <SkeletonBlock className="h-24 rounded-xl" />

      <span className="sr-only">Loading your workspace…</span>
    </div>
  );
}
