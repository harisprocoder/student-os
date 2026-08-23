import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { getSettings } from "@/db/database";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BookOpen,
  Timer,
  Target,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Calendar,
  ClipboardList,
  Users,
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Smart Notes", desc: "Markdown-powered notes with search, tags, and folders" },
  { icon: ClipboardList, title: "Assignment Tracker", desc: "Never miss a deadline with priority-based tracking" },
  { icon: Calendar, title: "Timetable", desc: "Weekly schedule with current class indicators" },
  { icon: Users, title: "Attendance", desc: "Track attendance with smart percentage calculations" },
  { icon: GraduationCap, title: "Exam Planner", desc: "Countdown timers and preparation tracking" },
  { icon: BarChart3, title: "Marks & GPA", desc: "Weighted score calculations and grade tracking" },
  { icon: Timer, title: "Study Timer", desc: "Pomodoro timer with session logging" },
  { icon: Target, title: "Goals", desc: "Set goals with subtasks and track progress" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        if (settings.onboardingCompleted) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch {}
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-bold">DAE Student OS</span>
          </div>
          <Button onClick={() => navigate("/onboarding")} size="sm" className="gap-2">
            Get Started <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-6">
              <Zap className="size-3" /> Offline-first · No account required
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Everything a student needs,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                in one offline workspace.
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete student productivity app that runs entirely on your device.
              No cloud, no account, no data leaving your browser.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button onClick={() => navigate("/onboarding")} size="lg" className="gap-2 px-6">
                Get Started Free <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold">Built for real students</h2>
          <p className="text-sm text-muted-foreground mt-2">Every feature works offline, powered by your browser's IndexedDB</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3">
                <f.icon className="size-4" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="rounded-2xl border border-border/60 bg-card p-8 sm:p-12 text-center">
          <Shield className="mx-auto size-10 text-indigo-500 mb-4" />
          <h2 className="text-xl font-bold">Your data stays on your device</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            No accounts, no cloud sync, no external APIs. Everything is stored in your
            browser's IndexedDB. When you close the tab, your data stays right here.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {["No sign-up required", "Works offline", "Export anytime", "PWA installable"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to get organized?</h2>
        <p className="text-sm text-muted-foreground mt-2">Start using DAE Student OS in seconds</p>
        <Button onClick={() => navigate("/onboarding")} size="lg" className="gap-2 mt-6 px-6">
          Get Started <ArrowRight className="size-4" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">DAE Student OS · Built with React, TypeScript, and IndexedDB</p>
        </div>
      </footer>
    </div>
  );
}
