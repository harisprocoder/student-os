import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUIStore, useSettingsStore } from "@/stores";
import { getSettings } from "@/db/database";
import { Toaster } from "sonner";
import { Sparkles } from "lucide-react";
import { SMOOTH, EXIT_EASE, SPRING_GENTLE } from "@/constants/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy routes
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Subjects = lazy(() => import("@/pages/Subjects"));
const SubjectDetail = lazy(() => import("@/pages/SubjectDetail"));
const Notes = lazy(() => import("@/pages/Notes"));
const NoteEditor = lazy(() => import("@/pages/NoteEditor"));
const Assignments = lazy(() => import("@/pages/Assignments"));
const Timetable = lazy(() => import("@/pages/Timetable"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Exams = lazy(() => import("@/pages/Exams"));
const Marks = lazy(() => import("@/pages/Marks"));
const StudyPlanner = lazy(() => import("@/pages/StudyPlanner"));
const StudyTimer = lazy(() => import("@/pages/StudyTimer"));
const Goals = lazy(() => import("@/pages/Goals"));
const Settings = lazy(() => import("@/pages/Settings"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Landing = lazy(() => import("@/pages/Landing"));

/* ─── Route Loading Skeleton ──────────────────────────────────────────────────── */
function RouteLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-indigo-500" />
    </div>
  );
}

/* ─── Page Transition Wrapper ─────────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: SMOOTH } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: EXIT_EASE } },
};

const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.05 } },
};

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const v = reduced ? pageVariantsReduced : pageVariants;
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={v} className="h-full">
      {children}
    </motion.div>
  );
}

/* ─── Route Syncer (iframe) ──────────────────────────────────────────────────── */
function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage({ type: "iframe-route-change", path: location.pathname }, "*");
  }, [location.pathname]);
  return null;
}

/* ─── Theme Manager ──────────────────────────────────────────────────────────── */
function ThemeManager() {
  const { currentTheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (currentTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(currentTheme);
    }
  }, [currentTheme]);

  useEffect(() => {
    if (currentTheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [currentTheme]);

  return null;
}

/* ─── Settings Loader ────────────────────────────────────────────────────────── */
function SettingsLoader() {
  const { setSettingsLoaded } = useSettingsStore();
  const { setCurrentTheme } = useUIStore();

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setCurrentTheme(settings.theme);
        setSettingsLoaded(true);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setSettingsLoaded(true);
      }
    })();
  }, [setCurrentTheme, setSettingsLoaded]);

  return null;
}

/* ─── Splash Screen ──────────────────────────────────────────────────────────── */
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete, reduced]);

  if (reduced) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090A0F]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EXIT_EASE }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: SMOOTH }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/20">
          <Sparkles className="size-8" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center"
        >
          <h1 className="text-lg font-bold tracking-tight text-white/90">Student OS</h1>
          <p className="mt-0.5 text-xs text-white/40">Preparing your workspace…</p>
        </motion.div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.3 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: SMOOTH }}
        className="mt-8 h-0.5 w-32 overflow-hidden rounded-full bg-white/10"
      >
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── App Routes ─────────────────────────────────────────────────────────────── */
function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteLoading />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<PageTransitionWrapper><Dashboard /></PageTransitionWrapper>} />
            <Route path="/subjects" element={<PageTransitionWrapper><Subjects /></PageTransitionWrapper>} />
            <Route path="/subjects/:id" element={<PageTransitionWrapper><SubjectDetail /></PageTransitionWrapper>} />
            <Route path="/notes" element={<PageTransitionWrapper><Notes /></PageTransitionWrapper>} />
            <Route path="/notes/new" element={<PageTransitionWrapper><NoteEditor /></PageTransitionWrapper>} />
            <Route path="/notes/:id" element={<PageTransitionWrapper><NoteEditor /></PageTransitionWrapper>} />
            <Route path="/assignments" element={<PageTransitionWrapper><Assignments /></PageTransitionWrapper>} />
            <Route path="/timetable" element={<PageTransitionWrapper><Timetable /></PageTransitionWrapper>} />
            <Route path="/attendance" element={<PageTransitionWrapper><Attendance /></PageTransitionWrapper>} />
            <Route path="/exams" element={<PageTransitionWrapper><Exams /></PageTransitionWrapper>} />
            <Route path="/marks" element={<PageTransitionWrapper><Marks /></PageTransitionWrapper>} />
            <Route path="/study-planner" element={<PageTransitionWrapper><StudyPlanner /></PageTransitionWrapper>} />
            <Route path="/study-timer" element={<PageTransitionWrapper><StudyTimer /></PageTransitionWrapper>} />
            <Route path="/goals" element={<PageTransitionWrapper><Goals /></PageTransitionWrapper>} />
            <Route path="/settings" element={<PageTransitionWrapper><Settings /></PageTransitionWrapper>} />
          </Route>
          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold">404</h1>
                  <p className="mt-2 text-muted-foreground">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

/* ─── Splash State Hook ──────────────────────────────────────────────────────── */
function useSplashComplete() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("student-os-splash") === "done";
  });
  const onComplete = useCallback(() => {
    sessionStorage.setItem("student-os-splash", "done");
    setSplashDone(true);
  }, []);
  return { splashDone, onComplete };
}

/* ─── App Root ───────────────────────────────────────────────────────────────── */
export default function App() {
  const { splashDone, onComplete } = useSplashComplete();

  return (
    <BrowserRouter>
      <ThemeManager />
      <SettingsLoader />
      <RouteSyncer />
      <AnimatePresence>
        {!splashDone && <SplashScreen key="splash" onComplete={onComplete} />}
      </AnimatePresence>
      {splashDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: SMOOTH }}>
          <AppRoutes />
        </motion.div>
      )}
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  );
}
