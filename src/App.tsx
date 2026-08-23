import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUIStore, useSettingsStore } from "@/stores";
import { getSettings } from "@/db/database";
import { Toaster } from "sonner";

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

function RouteLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-indigo-500" />
    </div>
  );
}

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*"
    );
  }, [location.pathname]);
  return null;
}

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

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/study-timer" element={<StudyTimer />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
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
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeManager />
      <SettingsLoader />
      <RouteSyncer />
      <AppRoutes />
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  );
}
