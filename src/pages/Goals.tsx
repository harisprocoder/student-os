import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { useGoals } from "@/hooks/useGoals";
import type { Goal, Subtask } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Target, Pencil, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function Goals() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, getGoalProgress } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    priority: "medium" as "low" | "medium" | "high",
    subtasks: [] as { id: string; text: string; completed: boolean }[],
  });

  const resetForm = () => {
    setForm({ title: "", description: "", deadline: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), priority: "medium", subtasks: [] });
    setEditId(null);
  };

  const active = useMemo(() => goals.filter((g) => !g.completed), [goals]);
  const completed = useMemo(() => goals.filter((g) => g.completed), [goals]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const data = {
      title: form.title,
      description: form.description,
      deadline: new Date(form.deadline).getTime(),
      priority: form.priority,
      subtasks: form.subtasks,
    };
    try {
      if (editId) {
        const goal = goals.find((g) => g.id === editId);
        const allDone = data.subtasks.length > 0 && data.subtasks.every((s) => s.completed);
        await updateGoal(editId, { ...data, completed: allDone });
        toast.success("Goal updated");
      } else {
        await addGoal(data);
        toast.success("Goal created");
      }
      setShowForm(false);
      resetForm();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = (g: Goal) => {
    setForm({ title: g.title, description: g.description, deadline: format(new Date(g.deadline), "yyyy-MM-dd"), priority: g.priority, subtasks: [...g.subtasks] });
    setEditId(g.id);
    setShowForm(true);
  };

  const toggleSubtask = async (goal: Goal, subtaskId: string) => {
    const newSubtasks = goal.subtasks.map((st) => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    const allDone = newSubtasks.length > 0 && newSubtasks.every((s) => s.completed);
    await updateGoal(goal.id, { subtasks: newSubtasks, completed: allDone });
  };

  const addSubtaskToGoal = async (goal: Goal) => {
    if (!newSubtask.trim()) return;
    const newSubtasks = [...goal.subtasks, { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }];
    await updateGoal(goal.id, { subtasks: newSubtasks });
    setNewSubtask("");
  };

  const removeSubtaskFromGoal = async (goal: Goal, subtaskId: string) => {
    const newSubtasks = goal.subtasks.filter((st) => st.id !== subtaskId);
    await updateGoal(goal.id, { subtasks: newSubtasks });
  };

  const addSubtaskToForm = () => {
    if (!newSubtask.trim()) return;
    setForm({ ...form, subtasks: [...form.subtasks, { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }] });
    setNewSubtask("");
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
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">{active.length} active · {completed.length} completed</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="size-4" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
          <Target className="mx-auto size-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Set your first goal to start tracking progress</p>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 gap-2"><Plus className="size-4" /> New Goal</Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {active.map((goal) => {
            const progress = getGoalProgress(goal);
            const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
            const isExpanded = expandedId === goal.id;
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{goal.title}</h3>
                      {goal.description && <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(goal)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"><Pencil className="size-3.5" /></button>
                      <button onClick={async () => { await deleteGoal(goal.id); toast.success("Goal deleted"); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium shrink-0">{progress}%</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      goal.priority === "high" ? "bg-rose-100 text-rose-700" : goal.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>{goal.priority}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {goal.subtasks.filter((s) => s.completed).length}/{goal.subtasks.length} subtasks · {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? "Due today" : "Overdue"}
                    </span>
                  </div>

                  {goal.subtasks.length > 0 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : goal.id)} className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors">
                      {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                      {isExpanded ? "Hide" : "Show"} subtasks
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-border/40 p-3 space-y-1">
                    {goal.subtasks.map((st) => (
                      <button key={st.id} onClick={() => toggleSubtask(goal, st.id)}
                        className="flex items-center gap-2 w-full text-left rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                        {st.completed ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> : <Circle className="size-4 text-muted-foreground/40 shrink-0" />}
                        <span className={`text-xs flex-1 ${st.completed ? "line-through text-muted-foreground" : ""}`}>{st.text}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeSubtaskFromGoal(goal, st.id); }} className="rounded p-0.5 text-muted-foreground hover:text-rose-600">
                          <Trash2 className="size-3" />
                        </button>
                      </button>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add subtask..."
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtaskToGoal(goal); } }}
                        className="h-8 text-xs" />
                      <Button size="sm" onClick={() => addSubtaskToGoal(goal)} className="h-8">Add</Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Completed</h2>
              {completed.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-3 opacity-60">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-through">{goal.title}</p>
                  </div>
                  <button onClick={async () => { await deleteGoal(goal.id); }} className="rounded p-1 text-muted-foreground hover:text-rose-600"><Trash2 className="size-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle>{editId ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Goal title" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subtasks</Label>
              <div className="space-y-1">
                {form.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-2 py-1.5">
                    <span className="flex-1">{st.text}</span>
                    <button onClick={() => setForm({ ...form, subtasks: form.subtasks.filter((s) => s.id !== st.id) })} className="text-muted-foreground hover:text-rose-600">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add subtask..."
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtaskToForm(); } }}
                  className="h-8 text-xs" />
                <Button size="sm" onClick={addSubtaskToForm} className="h-8">Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
