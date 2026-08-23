import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAttendance } from "@/hooks/useAttendance";
import { useSubjects } from "@/hooks/useSubjects";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";



export default function Attendance() {
  const { records, loading, addRecord, deleteRecord, getSubjectAttendance, getOverallAttendance } = useAttendance();
  const { subjects } = useSubjects();
  const [showRecord, setShowRecord] = useState(false);
  const [form, setForm] = useState({ subjectId: "", date: format(new Date(), "yyyy-MM-dd"), status: "present" as "present" | "absent" | "late", notes: "" });
  const overall = getOverallAttendance();

  const handleRecord = async () => {
    if (!form.subjectId) {
      toast.error("Select a subject");
      return;
    }
    await addRecord({
      subjectId: form.subjectId,
      date: new Date(form.date).getTime(),
      status: form.status,
      notes: form.notes,
    });
    toast.success("Attendance recorded");
    setShowRecord(false);
    setForm({ subjectId: "", date: format(new Date(), "yyyy-MM-dd"), status: "present", notes: "" });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground">{records.length} records</p>
        </div>
        <Button onClick={() => setShowRecord(true)} className="gap-2">
          <Plus className="size-4" /> Record
        </Button>
      </div>

      {/* Overall */}
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo-500" />
          <h2 className="text-sm font-semibold">Overall Attendance</h2>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No attendance records yet</p>
        ) : (
          <>
            <div className="flex items-end gap-4 mb-4">
              <p className="text-4xl font-bold">{overall.percentage.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mb-1">
                {overall.percentage >= 75 ? (
                  <TrendingUp className="size-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="size-4 text-rose-500" />
                )}
                <span className={`text-xs font-medium ${overall.percentage >= 75 ? "text-emerald-600" : "text-rose-600"}`}>
                  {overall.percentage >= 90 ? "Excellent" : overall.percentage >= 75 ? "Good" : "Needs improvement"}
                </span>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overall.percentage, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  overall.percentage >= 75 ? "bg-emerald-500" : overall.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                }`}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4 text-center">
              <div>
                <p className="text-lg font-bold">{overall.total}</p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">{overall.present}</p>
                <p className="text-[11px] text-muted-foreground">Present</p>
              </div>
              <div>
                <p className="text-lg font-bold text-rose-600">{overall.absent}</p>
                <p className="text-[11px] text-muted-foreground">Absent</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{overall.late}</p>
                <p className="text-[11px] text-muted-foreground">Late</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Per Subject */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">By Subject</h2>
        {subjects.map((subject) => {
          const att = getSubjectAttendance(subject.id);
          if (att.total === 0) return null;
          return (
            <div key={subject.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
              <div className="size-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: subject.color }}>
                {subject.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{subject.name}</p>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      att.percentage >= 75 ? "bg-emerald-500" : att.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(att.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-sm font-bold shrink-0">{att.percentage.toFixed(0)}%</p>
            </div>
          );
        })}
        {subjects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Add subjects to track attendance</p>
        )}
      </div>

      {/* Recent Records */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Recent Records</h2>
        <div className="space-y-1">
          {records.slice(0, 10).map((r) => {
            const subject = subjects.find((s) => s.id === r.subjectId);
            const StatusIcon = r.status === "present" ? CheckCircle2 : r.status === "late" ? Clock : XCircle;
            const statusColor = r.status === "present" ? "text-emerald-500" : r.status === "late" ? "text-amber-500" : "text-rose-500";
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg bg-card border border-border/40 px-3 py-2">
                <StatusIcon className={`size-4 shrink-0 ${statusColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{subject?.name || "Unknown"}</p>
                  <p className="text-[11px] text-muted-foreground">{format(new Date(r.date), "MMM d, yyyy")}</p>
                </div>
                <span className={`text-[10px] font-medium uppercase ${statusColor}`}>{r.status}</span>
                <button
                  onClick={async () => { await deleteRecord(r.id); toast.success("Record deleted"); }}
                  className="rounded p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Dialog */}
      <Dialog open={showRecord} onOpenChange={setShowRecord}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(["present", "absent", "late"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, status: s })}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                      form.status === s
                        ? s === "present" ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                          s === "late" ? "border-amber-500 bg-amber-50 text-amber-700" :
                          "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecord(false)}>Cancel</Button>
            <Button onClick={handleRecord}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
