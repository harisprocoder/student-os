import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { format, differenceInDays } from "date-fns";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Subject, Assignment, AttendanceRecord, Exam, StudySession, Settings } from "@/types";
import {
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
  Timer,
  Target,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href: string;
}) {
  return (
    <Link to={href} className="group">
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
      >
        <div className="flex items-start justify-between">
          <div className={`flex size-9 items-center justify-center rounded-lg ${color}`}>
            <Icon className="size-4.5" />
          </div>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>}
        </div>
      </motion.div>
    </Link>
  );
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const subs = [
      liveQuery(() => db.subjects.toArray()).subscribe((s) => setSubjects(s)),
      liveQuery(() => db.assignments.toArray()).subscribe((a) => setAssignments(a)),
      liveQuery(() => db.attendance.toArray()).subscribe((a) => setAttendance(a)),
      liveQuery(() => db.exams.toArray()).subscribe((e) => setExams(e)),
      liveQuery(() => db.studySessions.toArray()).subscribe((s) => setSessions(s)),
    ];
    db.settings.get("default").then((s) => s && setSettings(s));
    return () => { subs.forEach((s) => s.unsubscribe()); };
  }, []);

  const pendingAssignments = useMemo(
    () => assignments.filter((a) => a.status !== "completed"),
    [assignments]
  );

  const upcomingExams = useMemo(
    () => exams.filter((e) => e.date >= Date.now()).slice(0, 3),
    [exams]
  );

  const attendancePct = useMemo(() => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((r) => r.status === "present").length;
    const late = attendance.filter((r) => r.status === "late").length;
    return Math.round(((present + late * 0.5) / attendance.length) * 100);
  }, [attendance]);

  const todayStudyMin = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => s.date >= today.getTime() && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const weeklyStudyMin = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions
      .filter((s) => s.date >= weekAgo && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const nextExam = useMemo(() => {
    const upcoming = exams.filter((e) => e.date >= Date.now());
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [exams]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {settings?.userName || "Student"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")} — Here is your overview
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        <StatCard
          icon={BookOpen}
          label="Subjects"
          value={subjects.length}
          sub={`${subjects.length > 0 ? "Active" : "Add your first subject"}`}
          color="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          href="/subjects"
        />
        <StatCard
          icon={Users}
          label="Attendance"
          value={`${attendancePct}%`}
          sub={attendance.length > 0 ? `${attendance.length} classes` : "No records yet"}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          href="/attendance"
        />
        <StatCard
          icon={ClipboardList}
          label="Assignments"
          value={pendingAssignments.length}
          sub={pendingAssignments.length > 0 ? `${assignments.length} total` : "All caught up!"}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          href="/assignments"
        />
        <StatCard
          icon={GraduationCap}
          label="Next Exam"
          value={
            nextExam
              ? `${differenceInDays(new Date(nextExam.date), new Date())}d`
              : "—"
          }
          sub={nextExam ? format(new Date(nextExam.date), "MMM d") : "No exams"}
          color="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          href="/exams"
        />
        <StatCard
          icon={Timer}
          label="Study Today"
          value={`${todayStudyMin}m`}
          sub={`Weekly: ${weeklyStudyMin}m`}
          color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          href="/study-timer"
        />
        <StatCard
          icon={Target}
          label="Goals"
          value={
            settings
              ? "Active"
              : "—"
          }
          sub="Track progress"
          color="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          href="/goals"
        />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Assignments */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="text-sm font-semibold">Upcoming Assignments</h2>
            <Link to="/assignments" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {pendingAssignments.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <ClipboardList className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No pending assignments</p>
              </div>
            ) : (
              pendingAssignments.slice(0, 5).map((a) => {
                const daysLeft = differenceInDays(new Date(a.dueDate), new Date());
                const subject = subjects.find((s) => s.id === a.subjectId);
                return (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: subject?.color || "#6366f1" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject?.name || "No subject"} · {format(new Date(a.dueDate), "MMM d")}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        daysLeft < 0
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          : daysLeft <= 2
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}
                    >
                      {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Upcoming Exams */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="text-sm font-semibold">Upcoming Exams</h2>
            <Link to="/exams" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {upcomingExams.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <GraduationCap className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No upcoming exams</p>
              </div>
            ) : (
              upcomingExams.map((e) => {
                const daysLeft = differenceInDays(new Date(e.date), new Date());
                const subject = subjects.find((s) => s.id === e.subjectId);
                return (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/10 to-amber-500/10 text-rose-600 dark:text-rose-400">
                      <GraduationCap className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject?.name} · {format(new Date(e.date), "MMM d, yyyy")} · {e.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{daysLeft}</p>
                      <p className="text-[10px] text-muted-foreground">days</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/60 bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "New Note", href: "/notes/new", icon: "📝" },
            { label: "New Assignment", href: "/assignments", icon: "📋" },
            { label: "Record Attendance", href: "/attendance", icon: "✅" },
            { label: "Start Studying", href: "/study-timer", icon: "⏱️" },
          ].map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted hover:shadow-sm"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
