import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useMarks } from "@/hooks/useMarks";
import { useSubjects } from "@/hooks/useSubjects";
import type { Mark } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, BarChart3, Pencil, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_BOUNDARIES = [
  { min: 90, gpa: 4.0, grade: "A" },
  { min: 80, gpa: 3.5, grade: "B+" },
  { min: 70, gpa: 3.0, grade: "B" },
  { min: 60, gpa: 2.5, grade: "C+" },
  { min: 50, gpa: 2.0, grade: "C" },
  { min: 40, gpa: 1.0, grade: "D" },
  { min: 0, gpa: 0.0, grade: "F" },
];

export default function Marks() {
  const { marks, loading, addMark, updateMark, deleteMark, getSubjectMarks, getOverallGPA } = useMarks();
  const { subjects } = useSubjects();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    type: "quiz" as Mark["type"],
    marksObtained: 0,
    totalMarks: 100,
    weight: 10,
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const resetForm = () => {
    setForm({ subjectId: "", title: "", type: "quiz", marksObtained: 0, totalMarks: 100, weight: 10, date: format(new Date(), "yyyy-MM-dd"), notes: "" });
    setEditId(null);
  };

  const overallGPA = getOverallGPA(DEFAULT_BOUNDARIES);

  const handleSave = async () => {
    if (!form.title.trim() || !form.subjectId) {
      toast.error("Title and subject are required");
      return;
    }
    const data = { ...form, date: new Date(form.date).getTime() };
    try {
      if (editId) {
        await updateMark(editId, data);
        toast.success("Mark updated");
      } else {
        await addMark(data);
        toast.success("Mark added");
      }
      setShowForm(false);
      resetForm();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = (m: Mark) => {
    setForm({
      subjectId: m.subjectId,
      title: m.title,
      type: m.type,
      marksObtained: m.marksObtained,
      totalMarks: m.totalMarks,
      weight: m.weight,
      date: format(new Date(m.date), "yyyy-MM-dd"),
      notes: m.notes,
    });
    setEditId(m.id);
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
          <h1 className="text-2xl font-bold tracking-tight">Marks & GPA</h1>
          <p className="text-sm text-muted-foreground">{marks.length} assessments</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="size-4" /> Add Mark
        </Button>
      </div>

      {/* GPA Overview */}
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-indigo-500" />
          <h2 className="text-sm font-semibold">Overall Performance</h2>
        </div>
        {marks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Add marks to see your GPA</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-4xl font-bold">{overallGPA.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">CGPA (out of 4.0)</p>
            </div>
            <div className="space-y-2">
              {subjects.map((s) => {
                const sm = getSubjectMarks(s.id);
                if (sm.marks.length === 0) return null;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs flex-1 truncate">{s.name}</span>
                    <span className="text-xs font-medium">{sm.percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Marks List */}
      {marks.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
          <BarChart3 className="mx-auto size-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No marks recorded</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first assessment result</p>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 gap-2"><Plus className="size-4" /> Add Mark</Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {marks.map((m) => {
            const subject = subjects.find((s) => s.id === m.subjectId);
            const pct = (m.marksObtained / m.totalMarks) * 100;
            const grade = DEFAULT_BOUNDARIES.find((b) => pct >= b.min);
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                <div className="size-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: (subject?.color || "#6366f1") + "20", color: subject?.color || "#6366f1" }}>
                  {grade?.grade || "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject?.name} · {m.type} · {format(new Date(m.date), "MMM d")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{m.marksObtained}/{m.totalMarks}</p>
                  <p className="text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(m)} className="rounded p-1 text-muted-foreground hover:bg-muted"><Pencil className="size-3" /></button>
                  <button onClick={async () => { await deleteMark(m.id); toast.success("Mark deleted"); }} className="rounded p-1 text-muted-foreground hover:text-rose-600"><Trash2 className="size-3" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle>{editId ? "Edit Mark" : "Add Mark"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assessment title" /></div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Mark["type"] })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                {["quiz", "assignment", "midterm", "final", "practical", "custom"].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Marks Obtained</Label><Input type="number" min={0} value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" min={1} value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Weight (%)</Label><Input type="number" min={0} max={100} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
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
