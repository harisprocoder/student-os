import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useSubjects } from "@/hooks/useSubjects";
import { useAssignments } from "@/hooks/useAssignments";
import { useAttendance } from "@/hooks/useAttendance";
import { useExams } from "@/hooks/useExams";
import { useMarks } from "@/hooks/useMarks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Users, ClipboardList, GraduationCap, BarChart3, Timer } from "lucide-react";

type Tab = "overview" | "assignments" | "attendance" | "exams" | "marks" | "sessions";

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const { assignments } = useAssignments();
  const { getSubjectAttendance } = useAttendance();
  const { exams } = useExams();
  const { marks } = useMarks();
  const { sessions } = useStudySessions();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const subject = subjects.find((s) => s.id === id);

  const subjectAssignments = assignments.filter((a) => a.subjectId === id);
  const subjectExams = exams.filter((e) => e.subjectId === id);
  const subjectMarks = marks.filter((m) => m.subjectId === id);
  const subjectSessions = sessions.filter((s) => s.subjectId === id);
  const subjectAttendance = id ? getSubjectAttendance(id) : { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };

  const currentTime = Date.now();

  useEffect(() => {
    if (!subject && subjects.length > 0) {
      navigate("/subjects");
    }
  }, [subject, subjects, navigate]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">Subject not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/subjects")}>
            Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "assignments", label: "Assignments", icon: ClipboardList },
    { key: "attendance", label: "Attendance", icon: Users },
    { key: "exams", label: "Exams", icon: GraduationCap },
    { key: "marks", label: "Marks", icon: BarChart3 },
    { key: "sessions", label: "Sessions", icon: Timer },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/subjects")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: subject.color + "20" }}
          >
            <BookOpen className="size-5" style={{ color: subject.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{subject.code} · {subject.teacher}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold mt-1">{subjectAssignments.length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold mt-1">{Math.round(subjectAttendance.percentage)}%</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Upcoming Exams</p>
              <p className="text-2xl font-bold mt-1">{subjectExams.filter((e) => e.date >= currentTime).length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Room</p>
              <p className="text-2xl font-bold mt-1">{subject.room || "—"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Study Sessions</p>
              <p className="text-2xl font-bold mt-1">{subjectSessions.length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Marks</p>
              <p className="text-2xl font-bold mt-1">{subjectMarks.length}</p>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-3">
            {subjectAssignments.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                <ClipboardList className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No assignments for this subject</p>
              </div>
            ) : (
              subjectAssignments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                  <div className="size-2 rounded-full" style={{ backgroundColor: subject.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">Due {format(new Date(a.dueDate), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    a.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : a.status === "in_progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {a.status.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{subjectAttendance.total}</p>
                <p className="text-xs text-muted-foreground">Total Classes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{subjectAttendance.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-600">{subjectAttendance.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{subjectAttendance.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-sm font-bold">{Math.round(subjectAttendance.percentage)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, subjectAttendance.percentage)}%`,
                    backgroundColor: subjectAttendance.percentage >= 75 ? "#10b981" : subjectAttendance.percentage >= 60 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-3">
            {subjectExams.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                <GraduationCap className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No exams for this subject</p>
              </div>
            ) : (
              subjectExams.map((e) => {
                const daysLeft = Math.ceil((e.date - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                      <GraduationCap className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(e.date), "MMM d, yyyy")} · {e.time || "TBA"}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      daysLeft < 0 ? "bg-slate-100 text-slate-600" : daysLeft <= 7 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {daysLeft < 0 ? "Past" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "marks" && (
          <div className="space-y-3">
            {subjectMarks.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                <BarChart3 className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No marks recorded for this subject</p>
              </div>
            ) : (
              subjectMarks.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                    <BarChart3 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.type} · {m.marksObtained}/{m.totalMarks} ({m.weight ? `${m.weight}% weight` : "unweighted"})
                    </p>
                  </div>
                  <span className="text-sm font-bold">{m.marksObtained}/{m.totalMarks}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            {subjectSessions.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                <Timer className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No study sessions for this subject</p>
              </div>
            ) : (
              subjectSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                    <Timer className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(s.date), "MMM d")} · {s.duration} min
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
