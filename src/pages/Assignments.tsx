import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, isToday } from "date-fns";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubjects } from "@/hooks/useSubjects";
import type { Assignment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

type Filter = "all" | "today" | "upcoming" | "completed";

const PRIORITY_STYLES = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const STATUS_ICONS = {
  todo: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

const STATUS_STYLES = {
  todo: "text-muted-foreground",
  in_progress: "text-amber-600 dark:text-amber-400",
  completed: "text-emerald-600 dark:text-emerald-400",
};

export default function Assignments() {
  const { assignments, loading, addAssignment, updateAssignment, deleteAssignment, toggleStatus } = useAssignments();
  const { subjects } = useSubjects();
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in_progress" | "completed",
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      subjectId: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      priority: "medium",
      status: "todo",
    });
    setEditId(null);
  };

  const now = Date.now();

  const filtered = useMemo(() => {
    switch (filter) {
      case "today":
        return assignments.filter((a) => isToday(new Date(a.dueDate)) && a.status !== "completed");
      case "upcoming":
        return assignments.filter((a) => a.dueDate >= now && a.status !== "completed");
      case "completed":
        return assignments.filter((a) => a.status === "completed");
      default:
        return assignments;
    }
  }, [assignments, filter]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const data = {
      title: form.title,
      description: form.description,
      subjectId: form.subjectId || null,
      dueDate: new Date(form.dueDate).getTime(),
      priority: form.priority,
      status: form.status,
      checklist: editId ? assignments.find((a) => a.id === editId)?.checklist || [] : [],
    };
    try {
      if (editId) {
        await updateAssignment(editId, data);
        toast.success("Assignment updated");
      } else {
        await addAssignment(data);
        toast.success("Assignment created");
      }
      setShowForm(false);
      resetForm();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = (a: Assignment) => {
    setForm({
      title: a.title,
      description: a.description,
      subjectId: a.subjectId || "",
      dueDate: format(new Date(a.dueDate), "yyyy-MM-dd"),
      priority: a.priority,
      status: a.status,
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAssignment(id);
    toast.success("Assignment deleted");
  };

  const cycleStatus = async (a: Assignment) => {
    const next = a.status === "todo" ? "in_progress" : a.status === "in_progress" ? "completed" : "todo";
    await toggleStatus(a.id, next);
    if (next === "completed") toast.success("Assignment completed! 🎉");
  };

  const addChecklistItem = async (a: Assignment) => {
    const text = prompt("Checklist item:");
    if (!text?.trim()) return;
    const newChecklist = [...a.checklist, { id: crypto.randomUUID(), text: text.trim(), completed: false }];
    await updateAssignment(a.id, { checklist: newChecklist });
  };

  const toggleChecklistItem = async (a: Assignment, itemId: string) => {
    const newChecklist = a.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateAssignment(a.id, { checklist: newChecklist });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            {assignments.filter((a) => a.status !== "completed").length} pending · {assignments.filter((a) => a.status === "completed").length} completed
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="size-4" />
          New Assignment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "today", "upcoming", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === f
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignment List */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center"
        >
          <ClipboardList className="mx-auto size-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">
            {filter === "completed" ? "No completed assignments" : "No assignments here"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "today"
              ? "Nothing due today. Enjoy your day!"
              : filter === "completed"
              ? "Complete an assignment to see it here"
              : "Create your first assignment to start tracking"}
          </p>
          {filter !== "completed" && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 gap-2">
              <Plus className="size-4" /> New Assignment
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((a) => {
              const StatusIcon = STATUS_ICONS[a.status];
              const subject = subjects.find((s) => s.id === a.subjectId);
              const daysLeft = differenceInDays(new Date(a.dueDate), new Date());
              const isExpanded = expandedId === a.id;
              const completedChecklist = a.checklist.filter((c) => c.completed).length;

              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-xl border bg-card transition-all ${
                    a.status === "completed" ? "opacity-60" : "border-border/60 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => cycleStatus(a)}
                      className={`shrink-0 transition-colors ${STATUS_STYLES[a.status]}`}
                    >
                      <StatusIcon className="size-5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            a.status === "completed" ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {a.title}
                        </p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[a.priority]}`}>
                          {a.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {subject && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: subject.color + "20", color: subject.color }}
                          >
                            {subject.name}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(a.dueDate), "MMM d")}
                        </span>
                        {daysLeft >= 0 && a.status !== "completed" && (
                          <span
                            className={`text-[11px] font-medium ${
                              daysLeft <= 2 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                            }`}
                          >
                            {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`}
                          </span>
                        )}
                        {a.checklist.length > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            {completedChecklist}/{a.checklist.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {a.checklist.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : a.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(a)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Checklist */}
                  <AnimatePresence>
                    {isExpanded && a.checklist.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border/40"
                      >
                        <div className="space-y-1 p-3 pl-12">
                          {a.checklist.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => toggleChecklistItem(a, item.id)}
                              className="flex items-center gap-2 w-full text-left rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors"
                            >
                              <div
                                className={`size-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                  item.completed
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-muted-foreground/30"
                                }`}
                              >
                                {item.completed && (
                                  <svg className="size-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <span className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                {item.text}
                              </span>
                            </button>
                          ))}
                          <button
                            onClick={() => addChecklistItem(a)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline pl-6"
                          >
                            + Add item
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Assignment" : "New Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Assignment title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Details about the assignment..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subject</Label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">No subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "todo" | "in_progress" | "completed" })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editId ? "Save Changes" : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
