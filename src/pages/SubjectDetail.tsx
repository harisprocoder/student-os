import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { useSubjects } from "@/hooks/useSubjects";
import { useAssignments } from "@/hooks/useAssignments";
import { useAttendance } from "@/hooks/useAttendance";
import { useExams } from "@/hooks/useExams";
import { useMarks } from "@/hooks/useMarks";
import { useStudySessions } from "@/hooks/useStudySessions";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
  BarChart3,
  Timer,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: Users },
  { id: "exams", label: "Exams", icon: GraduationCap },
  { id: "marks", label: "Marks", icon: BarChart3 },
  { id: "sessions", label: "Sessions", icon: Timer },
];

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const { assignments } = useAssignments();
  const { getSubjectAttendance } = useAttendance();
  const { exams } = useExams();
  const { getSubjectMarks } = useMarks();
  const { getSubjectTotal } = useStudySessions();
  const [activeTab, setActiveTab] = useState("overview");

  const subject = subjects.find((s) => s.id === id);

  useEffect(() => {
    if (subjects.length > 0 && !subject) {
      navigate("/subjects");
    }
  }, [subjects, subject, navigate]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-indigo-500" />
      </div>
    );
  }

  const subjectAssignments = assignments.filter((a) => a.subjectId === id);
  const subjectExams = exams.filter((e) => e.subjectId === id);
  const att = getSubjectAttendance(id ?? "");
  const marksData = getSubjectMarks(id ?? "");
  const studyMin = getSubjectTotal(id ?? "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/subjects")} className="rounded-lg p-2 hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: subject.color }}>
            {subject.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{subject.code} · {subject.teacher}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex gap-1 overflow-x-auto border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="subject-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === "overview" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold mt-1">{att.percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{att.present}P / {att.absent}A / {att.late}L of {att.total}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Pending Assignments</p>
              <p className="text-2xl font-bold mt-1">{subjectAssignments.filter((a) => a.status !== "completed").length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Study Time</p>
              <p className="text-2xl font-bold mt-1">{studyMin}m</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Average Marks</p>
              <p className="text-2xl font-bold mt-1">{marksData.percentage.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Upcoming Exams</p>
              <p className="text-2xl font-bold mt-1">{subjectExams.filter((e) => e.date >= Date.now()).length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Room</p>
              <p className="text-2xl font-bold mt-1">{subject.room || "—"}</p>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-2">
            {subjectAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No assignments for this subject</p>
            ) : (
              subjectAssignments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                  <div className={`size-2 rounded-full ${a.status === "completed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {format(new Date(a.dueDate), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {a.status === "completed" ? "Done" : a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold">{att.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
              <div><p className="text-2xl font-bold text-emerald-600">{att.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
              <div><p className="text-2xl font-bold text-rose-600">{att.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
              <div><p className="text-2xl font-bold text-amber-600">{att.late}</p><p className="text-xs text-muted-foreground">Late</p></div>
            </div>
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${att.percentage}%` }} />
              </div>
              <p className="text-sm text-center mt-2 font-medium">{att.percentage.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-2">
            {subjectExams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No exams scheduled</p>
            ) : (
              subjectExams.map((e) => {
                const days = differenceInDays(new Date(e.date), new Date());
                return (
                  <div key={e.id} className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{e.title}</p>
                      <span className="text-xs text-muted-foreground">{days}d away</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(e.date), "MMM d, yyyy")} · {e.time} · {e.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">{e.syllabus}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "marks" && (
          <div className="space-y-2">
            {marksData.marks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No marks recorded</p>
            ) : (
              marksData.marks.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.type} · {format(new Date(m.date), "MMM d")}</p>
                  </div>
                  <p className="text-sm font-bold">{m.marksObtained}/{m.totalMarks}</p>
                  <p className="text-xs text-muted-foreground">{((m.marksObtained / m.totalMarks) * 100).toFixed(0)}%</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {studyMin > 0 ? `${studyMin} minutes studied total` : "No study sessions yet"}
          </p>
        )}
      </motion.div>
    </div>
  );
}
