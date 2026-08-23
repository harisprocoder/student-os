import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { useExams } from "@/hooks/useExams";
import { useSubjects } from "@/hooks/useSubjects";
import type { Exam } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

function CountdownCard({ exam }: { exam: Exam }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const examTime = new Date(exam.date);
  if (exam.time) {
    const [h, m] = exam.time.split(":").map(Number);
    examTime.setHours(h, m, 0, 0);
  }

  const days = differenceInDays(examTime, new Date(now));
  const hours = differenceInHours(examTime, new Date(now)) % 24;
  const minutes = differenceInMinutes(examTime, new Date(now)) % 60;

  return (
    <div className="flex items-center gap-3">
      {[
        { value: Math.max(0, days), label: "Days" },
        { value: Math.max(0, hours), label: "Hrs" },
        { value: Math.max(0, minutes), label: "Min" },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-lg font-bold">{item.value}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function Exams() {
  const { exams, loading, addExam, updateExam, deleteExam } = useExams();
  const { subjects } = useSubjects();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    location: "",
    syllabus: "",
    preparationStatus: "not_started" as "not_started" | "in_progress" | "ready",
    notes: "",
  });

  const resetForm = () => {
    setForm({ subjectId: "", title: "", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", location: "", syllabus: "", preparationStatus: "not_started", notes: "" });
    setEditId(null);
  };

  const currentTime = Date.now();
  const upcoming = exams.filter((e) => e.date >= currentTime);
  const past = exams.filter((e) => e.date < currentTime);

  const handleSave = async () => {
    if (!form.title.trim() || !form.subjectId) {
      toast.error("Title and subject are required");
      return;
    }
    const data = { ...form, date: new Date(form.date).getTime() };
    try {
      if (editId) {
        await updateExam(editId, data);
        toast.success("Exam updated");
      } else {
        await addExam(data);
        toast.success("Exam added");
      }
      setShowForm(false);
      resetForm();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = (e: Exam) => {
    setForm({
      subjectId: e.subjectId,
      title: e.title,
      date: format(new Date(e.date), "yyyy-MM-dd"),
      time: e.time,
      location: e.location,
      syllabus: e.syllabus,
      preparationStatus: e.preparationStatus,
      notes: e.notes,
    });
    setEditId(e.id);
    setShowForm(true);
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
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-sm text-muted-foreground">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="size-4" /> Add Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
          <GraduationCap className="mx-auto size-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No exams scheduled</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add an exam to start tracking preparation</p>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 gap-2"><Plus className="size-4" /> Add Exam</Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Upcoming</h2>
              {upcoming.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subjectId);
                const statusColors = {
                  not_started: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  ready: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                };
                return (
                  <motion.div key={exam.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: subject?.color || "#6366f1" }} />
                          <h3 className="text-sm font-semibold">{exam.title}</h3>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[exam.preparationStatus]}`}>
                            {exam.preparationStatus.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {subject?.name} · {format(new Date(exam.date), "MMM d, yyyy")} · {exam.time} · {exam.location}
                        </p>
                        {exam.syllabus && <p className="text-xs text-muted-foreground mt-1">{exam.syllabus}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(exam)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"><Pencil className="size-3.5" /></button>
                        <button onClick={async () => { await deleteExam(exam.id); toast.success("Exam deleted"); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"><Trash2 className="size-3.5" /></button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <CountdownCard exam={exam} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Past</h2>
              {past.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subjectId);
                return (
                  <div key={exam.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-3 opacity-60">
                    <GraduationCap className="size-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">{subject?.name} · {format(new Date(exam.date), "MMM d")}</p>
                    </div>
                    <button onClick={async () => { await deleteExam(exam.id); }} className="rounded p-1 text-muted-foreground hover:text-rose-600"><Trash2 className="size-3" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle>{editId ? "Edit Exam" : "Add Exam"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Exam title" />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Exam Hall A" /></div>
            <div className="space-y-2"><Label>Syllabus</Label><Textarea value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} rows={2} placeholder="Topics to cover..." /></div>
            <div className="space-y-2">
              <Label>Preparation</Label>
              <select value={form.preparationStatus} onChange={(e) => setForm({ ...form, preparationStatus: e.target.value as "not_started" | "in_progress" | "ready" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
