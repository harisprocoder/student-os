import { useEffect, useState, useRef, type ReactNode } from "react";
import { useNavigate, Link } from "react-router";
import { motion, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  BookOpen,
  Timer,
  Target,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Calendar,
  ClipboardList,
  Users,
  WifiOff,
  Shield,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

/* ─── Animation Tokens ───────────────────────────────────────────────────────── */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OUT } },
};

/* ─── Reduced Motion Variants ────────────────────────────────────────────────── */
const noAnim: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
};

function useVariants(reduced: boolean) {
  return {
    fadeUp: reduced ? noAnim : fadeUp,
    fadeIn: reduced ? noAnim : fadeIn,
    stagger: reduced ? noAnim : staggerContainer,
    scaleIn: reduced ? noAnim : scaleIn,
  };
}

/* ─── Section Wrapper ────────────────────────────────────────────────────────── */
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section id={id} ref={ref} className={className}>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ─── Desktop Product Mockup ─────────────────────────────────────────────────── */
function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Browser chrome */}
      <div className="rounded-t-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-400/60" />
            <div className="size-2.5 rounded-full bg-amber-400/60" />
            <div className="size-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-[10px] text-white/30">
            studentos.app/dashboard
          </div>
        </div>
      </div>
      {/* Dashboard content */}
      <div className="rounded-b-xl border border-t-0 border-white/10 bg-[#0d0e13] p-6">
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="hidden w-40 space-y-1 md:block">
            {["Dashboard", "Subjects", "Notes", "Assignments", "Timetable", "Attendance"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] ${
                    i === 0
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "text-white/30"
                  }`}
                >
                  <div
                    className={`size-1.5 rounded-full ${i === 0 ? "bg-indigo-400" : "bg-white/10"}`}
                  />
                  {item}
                </div>
              )
            )}
          </div>
          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Greeting */}
            <div>
              <div className="text-xs text-white/30">Tuesday, Sep 2</div>
              <div className="mt-0.5 text-sm font-semibold text-white/80">
                Good morning, Student
              </div>
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Subjects", value: "5", color: "from-indigo-500 to-violet-600" },
                { label: "Attendance", value: "87%", color: "from-emerald-500 to-teal-600" },
                { label: "Assignments", value: "3", color: "from-amber-500 to-orange-600" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <div
                    className={`mb-2 flex size-6 items-center justify-center rounded-md bg-gradient-to-br ${s.color}`}
                  >
                    <div className="size-2 rounded-sm bg-white/80" />
                  </div>
                  <div className="text-lg font-bold text-white/80">{s.value}</div>
                  <div className="text-[9px] text-white/25">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Activity bar */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-white/30">Study Overview</span>
                <span className="text-[9px] text-emerald-400/60">+12% this week</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: 1.2, delay: 1, ease: EASE_OUT }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile Product Mockup ──────────────────────────────────────────────────── */
function MobileMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0e13] p-3">
        {/* Status bar */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-[8px] text-white/30">9:41</span>
          <div className="flex gap-1">
            <div className="size-1 rounded-full bg-white/30" />
            <div className="size-1 rounded-full bg-white/30" />
            <div className="size-1 rounded-full bg-white/30" />
          </div>
        </div>
        {/* Content */}
        <div className="space-y-3 px-1">
          <div className="text-[10px] font-semibold text-white/70">Good morning</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "5", l: "Subjects" },
              { v: "87%", l: "Attendance" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-2"
              >
                <div className="text-sm font-bold text-white/80">{s.v}</div>
                <div className="text-[7px] text-white/25">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2">
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded bg-amber-500/20">
                <div className="size-2 rounded-sm bg-amber-400/60" />
              </div>
              <div className="flex-1">
                <div className="text-[9px] text-white/60">Next: OS Assignment</div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-2/3 rounded-full bg-amber-500/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom nav */}
        <div className="mt-3 flex items-center justify-around border-t border-white/5 pt-2">
          {["H", "S", "N", "A"].map((l, i) => (
            <div
              key={l}
              className={`flex size-6 items-center justify-center rounded-full text-[8px] font-bold ${
                i === 0 ? "bg-indigo-500/20 text-indigo-400" : "text-white/20"
              }`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const v = useVariants(reduced);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setScrolled(y > 40));
    return unsub;
  }, [scrollY]);

  /* Check if onboarding completed — redirect to dashboard */
  useEffect(() => {
    import("@/db/database").then(({ getSettings }) => {
      getSettings().then((s) => {
        if (s.onboardingCompleted) navigate("/dashboard", { replace: true });
      }).catch(() => {});
    });
  }, [navigate]);

  const handleNav = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Offline", href: "#offline" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Skip to content ── */}
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-20 bg-white px-4 py-2 text-sm font-semibold text-black transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* ── Navigation ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/5 bg-[#131210]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c75b32] to-[#a04825]">
              <Sparkles className="size-4 text-white" />
            </div>
            <span
              className="text-sm font-bold tracking-tight text-white/90"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Student OS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="text-[13px] font-medium text-white/50 transition-colors hover:text-white/80"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              size="sm"
              className="hidden gap-1.5 bg-[#c75b32] text-white hover:bg-[#a04825] md:inline-flex"
            >
              Open Student OS
              <ArrowRight className="size-3.5" />
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-[#131210]/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => handleNav(l.href)}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                >
                  {l.label}
                </button>
              ))}
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard");
                }}
                className="mt-2 w-full gap-1.5 bg-[#c75b32] text-white hover:bg-[#a04825]"
              >
                Open Student OS
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.header>

      <main id="main">
        {/* ═══ SECTION 1 — HERO ═══════════════════════════════════════════════ */}
        <section className="relative min-h-[100dvh] overflow-hidden bg-[#0c0b0a]">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Gradient orbs */}
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-[#c75b32]/[0.04] blur-[120px]" />
          <div className="absolute right-1/4 top-1/2 size-[400px] rounded-full bg-indigo-500/[0.03] blur-[100px]" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
            {/* Tagline */}
            <motion.div
              variants={v.fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c75b32]/20 bg-[#c75b32]/[0.06] px-4 py-1.5"
            >
              <Zap className="size-3 text-[#c75b32]" />
              <span
                className="text-[11px] font-semibold tracking-wide text-[#c75b32]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                OFFLINE-FIRST STUDENT WORKSPACE
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={v.fadeUp}
              initial="hidden"
              animate="visible"
              style={{ transitionDelay: "0.1s", fontFamily: "var(--font-display)" }}
              className="max-w-3xl text-center text-4xl font-medium leading-[1.08] tracking-tight text-white/95 sm:text-5xl lg:text-6xl"
            >
              Study smarter.
              <br />
              <span className="text-[#c75b32]">Stay organized.</span>
              <br />
              Own your academic life.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={v.fadeUp}
              initial="hidden"
              animate="visible"
              style={{ transitionDelay: "0.2s" }}
              className="mt-6 max-w-xl text-center text-base leading-relaxed text-white/40 sm:text-lg"
            >
              A complete student productivity workspace — subjects, notes, assignments,
              timetable, attendance, exams, marks, and study goals. Everything stays
              on your device. No cloud. No account. No compromise.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={v.fadeUp}
              initial="hidden"
              animate="visible"
              style={{ transitionDelay: "0.3s" }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            >
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="gap-2 bg-[#c75b32] px-8 text-white hover:bg-[#a04825]"
              >
                Open Student OS
                <ArrowRight className="size-4" />
              </Button>
              <Button
                onClick={() => handleNav("#features")}
                variant="ghost"
                size="lg"
                className="gap-2 text-white/50 hover:text-white/80"
              >
                See what's inside
                <ChevronDown className="size-4" />
              </Button>
            </motion.div>

            {/* Product mockup */}
            <motion.div
              variants={v.scaleIn}
              initial="hidden"
              animate="visible"
              style={{ transitionDelay: "0.4s" }}
              className="mt-16 w-full"
            >
              <ProductMockup />
            </motion.div>
          </div>
        </section>

        {/* ═══ SECTION 2 — PRODUCT INTRO ═════════════════════════════════════ */}
        <Section id="intro" className="bg-[#f5f2ed] py-24 sm:py-32">
          <motion.div variants={v.stagger} className="mx-auto max-w-5xl px-5 sm:px-8">
            <motion.div variants={v.fadeUp}>
              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75b32]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                The Problem
              </span>
            </motion.div>
            <motion.h2
              variants={v.fadeUp}
              className="mt-4 max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-[#1c1915] sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your academic life is scattered across dozens of apps, notebooks, and
              spreadsheets. Nothing talks to everything.
            </motion.h2>
            <motion.p
              variants={v.fadeUp}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[#5a5550]"
            >
              Student OS brings subjects, notes, assignments, timetable, attendance,
              exams, marks, and study goals into a single, unified workspace — one that
              works entirely offline and keeps your data private by design.
            </motion.p>
          </motion.div>
        </Section>

        {/* ═══ SECTION 3 — FEATURES ══════════════════════════════════════════ */}
        <Section id="features" className="bg-[#131210] py-24 sm:py-32">
          <motion.div variants={v.stagger} className="mx-auto max-w-5xl px-5 sm:px-8">
            <motion.div variants={v.fadeUp} className="mb-16">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75b32]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Features
              </span>
              <h2
                className="mt-4 max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-white/90 sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Everything schoolwork touches, in one place.
              </h2>
            </motion.div>

            {/* Feature grid — varied compositions */}
            <div className="space-y-6">
              {/* Row 1: Subject Management — full width */}
              <motion.div
                variants={v.fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15">
                        <BookOpen className="size-5 text-indigo-400" />
                      </div>
                      <span className="lp-section-label">01</span>
                    </div>
                    <h3
                      className="mt-4 text-xl font-semibold text-white/90"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Subject Management
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/40">
                      Organize every course with color coding, teacher info, and room
                      numbers. Each subject becomes its own connected workspace for notes,
                      assignments, and attendance.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Data Structures", "Operating Systems", "Database Systems", "Networks", "Software Eng."].map(
                      (name, i) => (
                        <div
                          key={name}
                          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                        >
                          <div
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i],
                            }}
                          />
                          <span className="text-[11px] text-white/50">{name}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Row 2: Two columns */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15">
                      <ClipboardList className="size-5 text-amber-400" />
                    </div>
                    <span className="lp-section-label">02</span>
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Assignment Tracker
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Track every task with priorities, checklists, and deadlines.
                    Filter by today, upcoming, or completed. Never miss a due date.
                  </p>
                </motion.div>

                <motion.div
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15">
                      <Calendar className="size-5 text-emerald-400" />
                    </div>
                    <span className="lp-section-label">03</span>
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Weekly Timetable
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Your complete class schedule at a glance. Organized by day and
                    time slot with subject colors and room info.
                  </p>
                </motion.div>
              </div>

              {/* Row 3: Two columns */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/15">
                      <GraduationCap className="size-5 text-rose-400" />
                    </div>
                    <span className="lp-section-label">04</span>
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Exam Planner
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Countdown timers to every exam. Track preparation status, log
                    syllabus topics, and never walk into a test unprepared.
                  </p>
                </motion.div>

                <motion.div
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15">
                      <BarChart3 className="size-5 text-violet-400" />
                    </div>
                    <span className="lp-section-label">05</span>
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Marks & GPA
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Weighted score calculation, grade boundaries, and a real-time
                    GPA calculator. See exactly where you stand.
                  </p>
                </motion.div>
              </div>

              {/* Row 4: Two columns */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/15">
                      <Timer className="size-5 text-cyan-400" />
                    </div>
                    <span className="lp-section-label">06</span>
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Pomodoro Timer
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Focus sessions with 25/5 and 50/10 presets. Every completed
                    session is logged automatically — build study streaks.
                  </p>
                </motion.div>

                <motion.div
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/15">
                      <Target className="size-5 text-teal-400" />
                    </div>
                    <span className="lp-section-label">07</span>
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Goal Tracking
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Break big academic goals into subtasks. Watch progress bars fill
                    up as you complete each step toward your targets.
                  </p>
                </motion.div>
              </div>

              {/* Row 5: Notes — full width */}
              <motion.div
                variants={v.fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10"
              >
                <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/15">
                        <BookOpen className="size-5 text-orange-400" />
                      </div>
                      <span className="lp-section-label">08</span>
                    </div>
                    <h3
                      className="mt-4 text-xl font-semibold text-white/90"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Markdown Notes
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/40">
                      Write in Markdown with full preview support. Organize by
                      subjects, folders, and tags. Pin important notes, archive old
                      ones, and search across everything instantly.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="size-2 rounded-full bg-orange-400/60" />
                        <span className="text-[11px] font-medium text-white/50">
                          Binary Trees — Traversal Methods
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] leading-relaxed text-white/30">
                        <p>
                          <span className="text-white/50"># Binary Trees</span>
                        </p>
                        <p>In-order: Left → Root → Right</p>
                        <p>Pre-order: Root → Left → Right</p>
                        <p className="mt-2 rounded bg-white/[0.03] p-2 font-mono text-[10px] text-emerald-400/50">
                          def in_order(node): if node: ...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        {/* ═══ SECTION 4 — OFFLINE FIRST ═════════════════════════════════════ */}
        <Section id="offline" className="bg-[#f5f2ed] py-24 sm:py-32">
          <motion.div variants={v.stagger} className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Text */}
              <div>
                <motion.span
                  variants={v.fadeUp}
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75b32]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Offline First
                </motion.span>
                <motion.h2
                  variants={v.fadeUp}
                  className="mt-4 text-3xl font-medium leading-[1.15] tracking-tight text-[#1c1915] sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your data never
                  <br />
                  leaves your device.
                </motion.h2>
                <motion.p
                  variants={v.fadeUp}
                  className="mt-5 max-w-md text-base leading-relaxed text-[#5a5550]"
                >
                  Built on IndexedDB with Dexie.js. No cloud sync, no external APIs,
                  no sign-up required. Everything works at full speed without an
                  internet connection. Install it as a PWA and use it anywhere.
                </motion.p>
                <motion.div variants={v.fadeUp} className="mt-8 flex flex-wrap gap-4">
                  {[
                    { icon: WifiOff, text: "Works offline" },
                    { icon: Lock, text: "Data stays local" },
                    { icon: Globe, text: "Installable PWA" },
                    { icon: Shield, text: "Export anytime" },
                  ].map((b) => (
                    <div
                      key={b.text}
                      className="flex items-center gap-2 text-sm text-[#1c1915]/70"
                    >
                      <CheckCircle2 className="size-4 text-[#2d8a56]" />
                      {b.text}
                    </div>
                  ))}
                </motion.div>
              </div>
              {/* Visual: Local storage architecture */}
              <motion.div variants={v.scaleIn} className="relative">
                <div className="rounded-2xl border border-[#1c1915]/10 bg-white p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-[#c75b32]/10">
                        <Lock className="size-5 text-[#c75b32]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1c1915]">
                          Your Browser
                        </div>
                        <div className="text-[11px] text-[#5a5550]">
                          IndexedDB via Dexie.js
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 pl-5">
                      {["Subjects", "Notes", "Assignments", "Timetable", "Attendance", "Exams", "Marks", "Goals"].map(
                        (table) => (
                          <div
                            key={table}
                            className="flex items-center gap-2 rounded-lg bg-[#f5f2ed] px-3 py-1.5"
                          >
                            <div className="size-1.5 rounded-full bg-[#c75b32]/40" />
                            <span className="text-[11px] font-medium text-[#1c1915]/60">
                              {table}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#1c1915]/10 bg-[#f5f2ed]/50 px-3 py-2 text-center">
                      <Shield className="size-4 text-[#2d8a56]" />
                      <span className="text-[11px] font-medium text-[#1c1915]/50">
                        100% local · Zero server calls
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        {/* ═══ SECTION 5 — HOW IT WORKS ══════════════════════════════════════ */}
        <Section id="how-it-works" className="bg-[#131210] py-24 sm:py-32">
          <motion.div variants={v.stagger} className="mx-auto max-w-5xl px-5 sm:px-8">
            <motion.div variants={v.fadeUp} className="mb-16 text-center">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75b32]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                How It Works
              </span>
              <h2
                className="mt-4 text-3xl font-medium leading-[1.15] tracking-tight text-white/90 sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Three steps to academic clarity.
              </h2>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "01",
                  title: "Set Up Your Workspace",
                  desc: "Add your subjects, set your attendance target, and personalize your profile in under a minute.",
                  color: "from-indigo-500 to-violet-600",
                },
                {
                  num: "02",
                  title: "Organize Your Academic Work",
                  desc: "Track assignments, plan your timetable, log attendance, and prepare for exams — all connected.",
                  color: "from-[#c75b32] to-[#a04825]",
                },
                {
                  num: "03",
                  title: "Build a Consistent Study System",
                  desc: "Use Pomodoro sessions, set goals, monitor marks, and build habits that compound over time.",
                  color: "from-emerald-500 to-teal-600",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  variants={v.fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div
                    className={`mb-4 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-sm font-bold text-white`}
                  >
                    {step.num}
                  </div>
                  <h3
                    className="text-lg font-semibold text-white/90"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ═══ SECTION 6 — MOBILE + DESKTOP ═══════════════════════════════════ */}
        <Section className="bg-[#f5f2ed] py-24 sm:py-32">
          <motion.div variants={v.stagger} className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Mobile mockup */}
              <motion.div variants={v.scaleIn} className="order-2 lg:order-1">
                <MobileMockup />
              </motion.div>
              {/* Text */}
              <div className="order-1 lg:order-2">
                <motion.span
                  variants={v.fadeUp}
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75b32]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Your Space
                </motion.span>
                <motion.h2
                  variants={v.fadeUp}
                  className="mt-4 text-3xl font-medium leading-[1.15] tracking-tight text-[#1c1915] sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tonight, made legible.
                </motion.h2>
                <motion.p
                  variants={v.fadeUp}
                  className="mt-5 max-w-md text-base leading-relaxed text-[#5a5550]"
                >
                  A personalized workspace that helps you understand your daily
                  academic tasks at a glance. See what's due, what's coming, and
                  where to focus — all from one dashboard.
                </motion.p>
                <motion.div variants={v.fadeUp} className="mt-6 flex flex-wrap gap-3">
                  {["Dashboard", "Quick Actions", "Study Overview", "Progress Tracking"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#1c1915]/10 bg-white px-3 py-1 text-[11px] font-medium text-[#1c1915]/60"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* ═══ SECTION 7 — FINAL CTA ═════════════════════════════════════════ */}
        <Section className="relative overflow-hidden bg-[#0c0b0a] py-24 sm:py-32">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-[#c75b32]/[0.05] blur-[120px]" />
          <motion.div variants={v.stagger} className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
            <motion.h2
              variants={v.fadeUp}
              className="text-3xl font-medium leading-[1.15] tracking-tight text-white/90 sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to take control
              <br />
              of your academic life?
            </motion.h2>
            <motion.p
              variants={v.fadeUp}
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/40"
            >
              Set up your workspace in under a minute. No sign-up, no cloud, no
              compromise. Just a better way to manage school.
            </motion.p>
            <motion.div variants={v.fadeUp} className="mt-8">
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="gap-2 bg-[#c75b32] px-10 text-white hover:bg-[#a04825]"
              >
                Open Student OS
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </Section>
      </main>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-[#0c0b0a] py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 sm:flex-row sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-[#c75b32] to-[#a04825]">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span
              className="text-xs font-bold tracking-tight text-white/50"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              DAE Student OS
            </span>
          </div>
          <div className="flex items-center gap-6">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="text-[11px] font-medium text-white/30 transition-colors hover:text-white/60"
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            size="sm"
            variant="ghost"
            className="gap-1 text-white/40 hover:text-white/70"
          >
            Open Student OS
            <ArrowRight className="size-3" />
          </Button>
        </div>
        <div className="mx-auto mt-6 max-w-5xl px-5 sm:px-8">
          <p className="text-center text-[11px] text-white/20">
            Built with React, TypeScript, and IndexedDB. All data stored locally.
          </p>
        </div>
      </footer>
    </div>
  );
}
