import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { format, differenceInDays } from "date-fns";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type {
  Subject,
  Assignment,
  AttendanceRecord,
  Exam,
  StudySession,
  Settings,
} from "@/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSettingsStore } from "@/stores";
import {
  dashboardContainer,
  summaryCard,
  widget,
} from "@/lib/animations";
import { SMOOTH } from "@/constants/motion";
import {
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
  Timer,
  Target,
  ArrowRight,
  Plus,
  FileText,
  CheckCircle2,
  Play,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Target as TargetIcon,
} from "lucide-react";

/* ─── Summary Card ───────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  href,
  animateCount,
  ring,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  href: string;
  animateCount?: boolean;
  ring?: number;
}) {
  return (
    <Link to={href} className="group block">
      <motion.div
        variants={summaryCard}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.2, ease: SMOOTH }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-4 transition-all duration-200 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20"
      >
        {/* Subtle gradient accent at top */}
        <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />

        <div className="flex items-start justify-between">
          <div
            className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}
          >
            <Icon className="size-4 text-white" />
          </div>
          {ring !== undefined ? (
            <ProgressRing
              value={ring}
              size={36}
              strokeWidth={3}
              color="oklch(0.615 0.24 264)"
            />
          ) : (
            <ArrowRight className="size-3.5 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          )}
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {animateCount && typeof value === "number" ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {label}
          </p>
          {sub && (
            <p className="mt-1 text-[11px] text-muted-foreground/50">{sub}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Upcoming List Item ─────────────────────────────────────────────────────── */
function UpcomingRow({
  title,
  subtitle,
  badge,
  badgeColor,
  dotColor,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  dotColor: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]">
      <div
        className="size-2 shrink-0 rounded-full ring-2 ring-white/5"
        style={{ backgroundColor: dotColor }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground/90">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground/60">{subtitle}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}
      >
        {badge}
      </span>
    </div>
  );
}

/* ─── Quick Action Card ──────────────────────────────────────────────────────── */
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  gradient,
  highlighted,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  gradient: string;
  highlighted?: boolean;
}) {
  return (
    <Link to={href} className="group block">
      <motion.div
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={`relative overflow-hidden rounded-xl border p-3 transition-all duration-200 ${
          highlighted
            ? "border-primary/20 bg-primary/5 hover:border-primary/30 hover:bg-primary/8"
            : "border-white/[0.06] bg-card hover:border-white/[0.12] hover:bg-card/80"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}
          >
            <Icon className="size-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground/90">
              {label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Study Overview Metric ──────────────────────────────────────────────────── */
function InsightMetric({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5">
      <div className={`flex size-7 items-center justify-center rounded-lg ${color}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground/60">{label}</p>
        <p className="text-sm font-bold text-foreground/90">{value}</p>
        {sub && (
          <p className="text-[10px] text-muted-foreground/40">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { settingsLoaded } = useSettingsStore();
  const reduced = useReducedMotion();

  useEffect(() => {
    const subs = [
      liveQuery(() => db.subjects.toArray()).subscribe((s) => setSubjects(s)),
      liveQuery(() => db.assignments.toArray()).subscribe((a) =>
        setAssignments(a)
      ),
      liveQuery(() => db.attendance.toArray()).subscribe((a) =>
        setAttendance(a)
      ),
      liveQuery(() => db.exams.toArray()).subscribe((e) => setExams(e)),
      liveQuery(() => db.studySessions.toArray()).subscribe((s) =>
        setSessions(s)
      ),
    ];
    db.settings
      .get("default")
      .then((s) => {
        if (s) setSettings(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      subs.forEach((s) => s.unsubscribe());
    };
  }, []);

  /* ─── Derived Data ────────────────────────────────────────────────────────── */
  const pendingAssignments = useMemo(
    () => assignments.filter((a) => a.status !== "completed"),
    [assignments]
  );

  const now = Date.now();

  const upcomingExams = useMemo(
    () => exams.filter((e) => e.date >= now).slice(0, 5),
    [exams, now]
  );

  const attendancePct = useMemo(() => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((r) => r.status === "present").length;
    const late = attendance.filter((r) => r.status === "late").length;
    return Math.round(
      ((present + late * 0.5) / attendance.length) * 100
    );
  }, [attendance]);

  const todayStudyMin = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => s.date >= today.getTime() && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const weeklyStudyMin = useMemo(() => {
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return sessions
      .filter((s) => s.date >= weekAgo && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions, now]);

  const completedGoals = useMemo(() => {
    // Goals count from goals table
    return 0; // Will be computed from goals table if needed
  }, []);

  const nextExam = useMemo(() => {
    const upcoming = exams.filter((e) => e.date >= now);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [exams, now]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getContextMessage = () => {
    const msgs: string[] = [];
    if (pendingAssignments.length > 0) {
      msgs.push(
        `${pendingAssignments.length} assignment${pendingAssignments.length > 1 ? "s" : ""} due soon`
      );
    }
    if (upcomingExams.length > 0) {
      msgs.push(
        `${upcomingExams.length} exam${upcomingExams.length > 1 ? "s" : ""} coming up`
      );
    }
    if (todayStudyMin > 0) {
      msgs.push(`${todayStudyMin} min studied today`);
    }
    if (msgs.length === 0) msgs.push("All caught up — great work!");
    return msgs.join(" · ");
  };

  /* ─── Loading State ───────────────────────────────────────────────────────── */
  if (loading || !settingsLoaded) {
    return <DashboardSkeleton />;
  }

  /* ─── Empty State ─────────────────────────────────────────────────────────── */
  const isEmpty =
    subjects.length === 0 &&
    assignments.length === 0 &&
    exams.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: SMOOTH }}
        >
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {settings?.userName || "Student"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </motion.div>

        <EmptyState
          icon={BookOpen}
          title="Welcome to Student OS"
          description="Start by adding your subjects. Once you do, your dashboard will come alive with assignments, exams, attendance, and study progress."
          action={
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
            >
              <Plus className="size-4" />
              Get Started
            </Link>
          }
        />
      </div>
    );
  }

  /* ─── Main Dashboard ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: SMOOTH }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {settings?.userName || "Student"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")} —{" "}
          <span className="text-muted-foreground/70">{getContextMessage()}</span>
        </p>
      </motion.div>

      {/* ── Summary Cards ── */}
      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        <StatCard
          icon={BookOpen}
          label="Active Subjects"
          value={subjects.length}
          sub={
            subjects.length > 0
              ? "In your curriculum"
              : "Add your first subject"
          }
          gradient="from-indigo-500 to-violet-600"
          href="/subjects"
          animateCount
        />
        <StatCard
          icon={Users}
          label="Attendance"
          value={`${attendancePct}%`}
          sub={
            attendance.length > 0
              ? `${attendance.length} classes recorded`
              : "No records yet"
          }
          gradient="from-emerald-500 to-teal-600"
          href="/attendance"
          ring={attendancePct}
        />
        <StatCard
          icon={ClipboardList}
          label="Assignments"
          value={pendingAssignments.length}
          sub={
            pendingAssignments.length > 0
              ? `${assignments.length} total · ${assignments.filter((a) => a.status === "completed").length} done`
              : "All caught up!"
          }
          gradient="from-amber-500 to-orange-600"
          href="/assignments"
          animateCount
        />
        <StatCard
          icon={GraduationCap}
          label="Next Exam"
          value={
            nextExam
              ? `${differenceInDays(new Date(nextExam.date), new Date())}d`
              : "—"
          }
          sub={
            nextExam
              ? `${nextExam.title} · ${format(new Date(nextExam.date), "MMM d")}`
              : "No exams scheduled"
          }
          gradient="from-rose-500 to-pink-600"
          href="/exams"
        />
        <StatCard
          icon={Timer}
          label="Study Today"
          value={`${todayStudyMin}m`}
          sub={`Weekly: ${Math.round(weeklyStudyMin / 60)}h ${weeklyStudyMin % 60}m`}
          gradient="from-violet-500 to-purple-600"
          href="/study-timer"
        />
        <StatCard
          icon={Target}
          label="Goals"
          value="Track"
          sub="View your progress"
          gradient="from-cyan-500 to-sky-600"
          href="/goals"
        />
      </motion.div>

      {/* ── Main Content: Two Columns ── */}
      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 lg:grid-cols-2"
      >
        {/* Upcoming Assignments */}
        <motion.div
          variants={widget}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground/60" />
              <h2 className="text-[13px] font-semibold">Upcoming Assignments</h2>
            </div>              <Link
              to="/dashboard/assignments"
              className="flex items-center gap-1 text-[11px] font-medium text-primary/80 transition-colors hover:text-primary"
            >
              View all
              <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {pendingAssignments.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="mx-auto size-8 text-emerald-500/40" />
                <p className="mt-2 text-[13px] font-medium text-foreground/70">
                  You're all caught up
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                  No pending assignments
                </p>
                <Link
                  to="/dashboard/assignments"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-3" />
                  Create assignment
                </Link>
              </div>
            ) : (
              pendingAssignments.slice(0, 5).map((a) => {
                const daysLeft = differenceInDays(
                  new Date(a.dueDate),
                  new Date()
                );
                const subject = subjects.find((s) => s.id === a.subjectId);
                return (
                  <UpcomingRow
                    key={a.id}
                    title={a.title}
                    subtitle={`${subject?.name || "No subject"} · ${format(new Date(a.dueDate), "MMM d")}`}
                    badge={
                      daysLeft < 0
                        ? "Overdue"
                        : daysLeft === 0
                          ? "Today"
                          : `${daysLeft}d left`
                    }
                    badgeColor={
                      daysLeft < 0
                        ? "bg-rose-500/15 text-rose-400"
                        : daysLeft <= 2
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-emerald-500/15 text-emerald-400"
                    }
                    dotColor={subject?.color || "#6366f1"}
                  />
                );
              })
            )}
          </div>
        </motion.div>

        {/* Upcoming Exams */}
        <motion.div
          variants={widget}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-muted-foreground/60" />
              <h2 className="text-[13px] font-semibold">Upcoming Exams</h2>
            </div>              <Link
              to="/dashboard/exams"
              className="flex items-center gap-1 text-[11px] font-medium text-primary/80 transition-colors hover:text-primary"
            >
              View all
              <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {upcomingExams.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Calendar className="mx-auto size-8 text-muted-foreground/30" />
                <p className="mt-2 text-[13px] font-medium text-foreground/70">
                  No upcoming exams
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                  Nothing on the horizon
                </p>
                <Link
                  to="/dashboard/exams"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-3" />
                  Add exam
                </Link>
              </div>
            ) : (
              upcomingExams.map((e) => {
                const daysLeft = differenceInDays(
                  new Date(e.date),
                  new Date()
                );
                const subject = subjects.find((s) => s.id === e.subjectId);
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/15 to-amber-500/15">
                      <GraduationCap className="size-4 text-rose-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground/90">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60">
                        {subject?.name} ·{" "}
                        {format(new Date(e.date), "MMM d, yyyy")} · {e.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground/90">
                        {daysLeft}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40">
                        days
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        variants={widget}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/[0.06] bg-card p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-primary" />
          <h2 className="text-[13px] font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <QuickAction
            icon={FileText}
            label="New Note"
            description="Write something down"
            href="/notes/new"
            gradient="from-indigo-500 to-violet-600"
          />
          <QuickAction
            icon={ClipboardList}
            label="New Assignment"
            description="Track a task"
            href="/assignments"
            gradient="from-amber-500 to-orange-600"
          />
          <QuickAction
            icon={CheckCircle2}
            label="Record Attendance"
            description="Log your presence"
            href="/attendance"
            gradient="from-emerald-500 to-teal-600"
          />
          <QuickAction
            icon={Play}
            label="Start Studying"
            description="Begin a focus session"
            href="/study-timer"
            gradient="from-violet-500 to-purple-600"
            highlighted
          />
        </div>
      </motion.div>

      {/* ── Study Overview ── */}
      <motion.div
        variants={widget}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/[0.06] bg-card p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground/60" />
          <h2 className="text-[13px] font-semibold">Study Overview</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InsightMetric
            icon={Clock}
            label="Weekly Study"
            value={`${Math.round(weeklyStudyMin / 60)}h ${weeklyStudyMin % 60}m`}
            color="bg-violet-500/15 text-violet-400"
          />
          <InsightMetric
            icon={ClipboardList}
            label="Completion"
            value={
              assignments.length > 0
                ? `${Math.round(
                    (assignments.filter((a) => a.status === "completed").length /
                      assignments.length) *
                      100
                  )}%`
                : "—"
            }
            sub={
              assignments.length > 0
                ? `${assignments.filter((a) => a.status === "completed").length}/${assignments.length} done`
                : "No assignments"
            }
            color="bg-amber-500/15 text-amber-400"
          />
          <InsightMetric
            icon={Users}
            label="Attendance"
            value={`${attendancePct}%`}
            sub={
              attendance.length > 0
                ? `${attendance.length} classes`
                : "No records"
            }
            color="bg-emerald-500/15 text-emerald-400"
          />
          <InsightMetric
            icon={TargetIcon}
            label="Sessions Today"
            value={`${todayStudyMin}m`}
            sub={`${sessions.filter((s) => s.completed && s.date >= new Date().setHours(0, 0, 0, 0)).length} completed`}
            color="bg-cyan-500/15 text-cyan-400"
          />
        </div>
      </motion.div>
    </div>
  );
}
