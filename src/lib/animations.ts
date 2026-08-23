import { SMOOTH, SNAPPY, EXIT_EASE, SPRING_SNAPPY, SPRING_GENTLE, SPRING_BOUNCE, SPRING_SIDEBAR, SPRING_DRAWER, DUR } from "@/constants/motion";

// ─── Dashboard ───────────────────────────────────────────────────────────────────
export const dashboardContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: DUR.staggerCard, delayChildren: 0.1 },
  },
};
export const summaryCard = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: SMOOTH },
  },
};
export const widget = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: SMOOTH },
  },
};

// ─── Cards ───────────────────────────────────────────────────────────────────────
export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderColor: "rgba(148,163,184,0.2)" },
  hover: {
    y: -2,
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    borderColor: "rgba(99,102,241,0.3)",
    transition: { duration: DUR.normal, ease: SMOOTH },
  },
  tap: { y: 0, scale: 0.995, transition: { duration: DUR.instant } },
};
export const subjectAccentBar = {
  rest: { height: "40%", opacity: 0.6 },
  hover: { height: "100%", opacity: 1, transition: { duration: 0.25, ease: SMOOTH } },
};
export const subjectIcon = {
  rest: { y: 0, rotate: 0 },
  hover: { y: -1, rotate: 3, transition: { duration: DUR.normal } },
};

// ─── Buttons ─────────────────────────────────────────────────────────────────────
export const btnPrimary = {
  rest: { scale: 1, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(99,102,241,0.25)", transition: { duration: DUR.fast, ease: SNAPPY } },
  tap: { scale: 0.97, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", transition: { duration: DUR.instant } },
};
export const btnIcon = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.08, transition: { duration: DUR.fast } },
  tap: { scale: 0.92, transition: { duration: DUR.instant } },
};
export const btnDanger = {
  rest: { scale: 1 },
  hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(244,63,94,0.25)", transition: { duration: DUR.fast } },
  tap: { scale: 0.97, transition: { duration: DUR.instant } },
};
export const fab = {
  hidden: { scale: 0, opacity: 0, rotate: -180 },
  visible: { scale: 1, opacity: 1, rotate: 0, transition: SPRING_SNAPPY },
  hover: { scale: 1.08, boxShadow: "0 8px 25px rgba(99,102,241,0.35)", transition: { duration: DUR.normal } },
  tap: { scale: 0.95, transition: { duration: DUR.instant } },
};

// ─── Modals / Dialogs ────────────────────────────────────────────────────────────
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.normal } },
  exit: { opacity: 0, transition: { duration: DUR.fast } },
};
export const modalPanel = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_GENTLE },
  exit: { opacity: 0, scale: 0.97, y: 5, transition: { duration: DUR.fast, ease: EXIT_EASE } },
};
export const warningIcon = {
  hidden: { scale: 0, rotate: -15 },
  visible: { scale: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 500, damping: 15, delay: 0.1 } },
};

// ─── Lists ───────────────────────────────────────────────────────────────────────
export const listContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: DUR.staggerChild } },
};
export const listItem = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: DUR.normal, ease: SMOOTH } },
  exit: { opacity: 0, x: 8, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: DUR.normal, ease: EXIT_EASE, height: { delay: 0.1, duration: 0.15 }, marginBottom: { delay: 0.1, duration: 0.15 }, paddingTop: { delay: 0.1, duration: 0.15 }, paddingBottom: { delay: 0.1, duration: 0.15 } } },
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────────
export const drawerBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.normal } },
  exit: { opacity: 0, transition: { duration: DUR.fast } },
};
export const drawerPanel = {
  hidden: { x: "-100%", opacity: 0.5 },
  visible: { x: "0%", opacity: 1, transition: SPRING_DRAWER },
  exit: { x: "-100%", opacity: 0, transition: { duration: DUR.normal, ease: EXIT_EASE } },
};

// ─── Checkbox / Toggle ───────────────────────────────────────────────────────────
export const checkbox = {
  unchecked: { scale: 1, borderColor: "rgba(148,163,184,0.5)", backgroundColor: "transparent" },
  checked: {
    scale: [1, 1.15, 1],
    borderColor: "rgb(99,102,241)",
    backgroundColor: "rgb(99,102,241)",
    transition: { scale: { duration: 0.25, ease: SNAPPY }, borderColor: { duration: DUR.fast }, backgroundColor: { duration: DUR.fast } },
  },
};

// ─── Progress ────────────────────────────────────────────────────────────────────
export const progressBar = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: { duration: 0.6, ease: SMOOTH },
  }),
};

// ─── Timer ───────────────────────────────────────────────────────────────────────
export const timerPulse = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: { repeat: Infinity, duration: 4, ease: [0.4, 0, 0.6, 1] as const },
  },
};
export const timerControl = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: DUR.fast } },
  tap: { scale: 0.92, transition: { duration: DUR.instant } },
};
export const sessionComplete = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25, staggerChildren: DUR.staggerCard } },
};
export const successCheck = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 0.4, ease: SNAPPY }, opacity: { duration: DUR.fast } } },
};

// ─── Empty States ────────────────────────────────────────────────────────────────
export const emptyState = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: SMOOTH, staggerChildren: 0.1 } },
};
export const emptyChild = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
export const emptyIconFloat = {
  animate: { y: [0, -6, 0], transition: { repeat: Infinity, duration: 3, ease: [0.4, 0, 0.6, 1] as const } },
};

// ─── Tabs ────────────────────────────────────────────────────────────────────────
export const tabContent = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0, transition: { duration: DUR.normal, ease: SMOOTH } },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -20 : 20, transition: { duration: DUR.fast, ease: EXIT_EASE } }),
};

// ─── Onboarding ──────────────────────────────────────────────────────────────────
export const onboardingStep = {
  enter: (direction: 1 | -1) => ({ opacity: 0, x: direction > 0 ? 60 : -60, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: SMOOTH } },
  exit: (direction: 1 | -1) => ({ opacity: 0, x: direction > 0 ? -60 : 60, scale: 0.98, transition: { duration: 0.25, ease: EXIT_EASE } }),
};
export const progressDot = {
  inactive: { scale: 1, backgroundColor: "rgba(148,163,184,0.3)", width: 8 },
  active: { scale: 1, backgroundColor: "rgb(99,102,241)", width: 24, transition: SPRING_SNAPPY },
  completed: { scale: 1, backgroundColor: "rgb(16,185,129)", width: 8, transition: { duration: DUR.normal } },
};

// ─── Form ────────────────────────────────────────────────────────────────────────
export const errorMessage = {
  hidden: { opacity: 0, y: -4, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: DUR.fast, ease: SMOOTH } },
  exit: { opacity: 0, y: -4, height: 0, transition: { duration: DUR.instant } },
};

// ─── Search / Command Palette ────────────────────────────────────────────────────
export const paletteOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.fast } },
  exit: { opacity: 0, transition: { duration: DUR.instant } },
};
export const palettePanel = {
  hidden: { opacity: 0, scale: 0.96, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { ...SPRING_SIDEBAR, mass: 0.8 } },
  exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: DUR.instant, ease: EXIT_EASE } },
};

// ─── Goal Completion ─────────────────────────────────────────────────────────────
export const goalComplete = {
  incomplete: { borderColor: "rgba(148,163,184,0.2)" },
  complete: { borderColor: ["rgba(16,185,129,0.3)", "rgba(16,185,129,0.6)", "rgba(16,185,129,0.3)"], transition: { duration: 1.5, repeat: 1 } },
};
export const goalCheck = {
  hidden: { scale: 0, opacity: 0, rotate: -45 },
  visible: { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 500, damping: 15, delay: 0.2 } },
};

// ─── Splash ──────────────────────────────────────────────────────────────────────
export const splashLogo = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: SMOOTH } },
  exit: { opacity: 0, scale: 1.05, y: -10, filter: "blur(4px)", transition: { duration: 0.25, ease: EXIT_EASE } },
};
export const appShellEntrance = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: SMOOTH, delay: 0.1 } },
};

// ─── PWA Install ─────────────────────────────────────────────────────────────────
export const installPrompt = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 3, ...SPRING_GENTLE } },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: DUR.normal } },
};

// ─── Offline Bar ─────────────────────────────────────────────────────────────────
export const offlineBar = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { height: { duration: DUR.normal }, opacity: { duration: DUR.fast, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { opacity: { duration: DUR.instant }, height: { duration: 0.15, delay: 0.05 } } },
};

// ─── Schedule ────────────────────────────────────────────────────────────────────
export const scheduleItem = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: DUR.normal } }),
};

// ─── Drag ────────────────────────────────────────────────────────────────────────
export const draggableIdle = { scale: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", zIndex: 0, cursor: "grab" as const };
export const draggableDragging = {
  scale: 1.03,
  boxShadow: "0 12px 35px rgba(0,0,0,0.15)",
  zIndex: 50,
  cursor: "grabbing" as const,
  rotate: 1,
  transition: SPRING_GENTLE,
};
