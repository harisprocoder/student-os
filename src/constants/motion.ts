// ─── Easing Curves ───────────────────────────────────────────────────────────────
// Primary easing — used for most enter/exit animations
export const SMOOTH = [0.25, 0.46, 0.45, 0.94] as const;

// Snappy easing — used for micro-interactions, button clicks
export const SNAPPY = [0.22, 0.68, 0, 1.0] as const;

// Exit easing — slightly faster for removals
export const EXIT_EASE = [0.55, 0, 1, 0.45] as const;

// ─── Spring Presets ──────────────────────────────────────────────────────────────
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.8 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };
export const SPRING_BOUNCE = { type: "spring" as const, stiffness: 500, damping: 15, mass: 0.6 };
export const SPRING_SIDEBAR = { type: "spring" as const, stiffness: 400, damping: 30 };
export const SPRING_DRAWER = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };

// ─── Durations (seconds) ─────────────────────────────────────────────────────────
export const DUR = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.4,
  page: 0.25,
  staggerChild: 0.05,
  staggerCard: 0.08,
} as const;
