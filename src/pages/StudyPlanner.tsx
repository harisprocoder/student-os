import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
} from "date-fns";
import { db } from "@/db/database";
import type { StudyPlan } from "@/types";
import { useSubjects } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  listContainer,
  listItem,
  emptyState,
  emptyChild,
  emptyIconFloat,
  btnPrimary,
} from "@/lib/animations";

export default function StudyPlanner() {
  const { subjects } = useSubjects();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await db.studyPlans.toArray();
    setPlans(
      data.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    setLoading(false);
  };

  useState(() => {
    refresh();
  });

  const dayPlans = useMemo(
    () =>
      plans.filter((p) =>
        isSameDay(new Date(p.date), selectedDate)
      ),
    [plans, selectedDate]
  );

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );

  const [form, setForm] = useState({
    subjectId: "",
    topic: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    duration: 30,
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleSave = async () => {
    if (!form.topic.trim()) {
      toast.error("Topic is required");
      return;
    }
    const plan: StudyPlan = {
      id: crypto.randomUUID(),
      subjectId: form.subjectId || null,
      topic: form.topic,
      date: new Date(form.date).getTime(),
      startTime: form.startTime,
      duration: form.duration,
      priority: form.priority,
      completed: false,
      createdAt: Date.now(),
    };
    await db.studyPlans.add(plan);
    toast.success("Study plan created");
    setShowForm(false);
    setForm({
      subjectId: "",
      topic: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      duration: 30,
      priority: "medium",
    });
    refresh();
  };

  const toggleComplete = async (plan: StudyPlan) => {
    await db.studyPlans.update(plan.id, {
      completed: !plan.completed,
    });
    refresh();
  };

  const deletePlan = async (id: string) => {
    await db.studyPlans.delete(id);
    toast.success("Plan deleted");
    refresh();
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
          <h1 className="text-2xl font-bold tracking-tight">Study Planner</h1>
          <p className="text-sm text-muted-foreground">
            {plans.length} plans
          </p>
        </div>
        <motion.div
          variants={btnPrimary}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            onClick={() => {
              setForm({
                ...form,
                date: format(selectedDate, "yyyy-MM-dd"),
              });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="size-4" /> Add Plan
          </Button>
        </motion.div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-4" />
        </motion.button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold">
            {format(selectedDate, "EEEE, MMM d")}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ChevronRight className="size-4" />
        </motion.button>
      </div>

      {/* Week Bar */}
      <div className="flex gap-1 overflow-x-auto">
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(day)}
              className={`flex-1 min-w-[52px] rounded-lg px-2 py-2 text-center transition-all ${
                isSelected
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800"
                  : isToday
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <p className="text-[10px] text-muted-foreground">
                {format(day, "EEE")}
              </p>
              <p
                className={`text-sm font-medium mt-0.5 ${
                  isToday
                    ? "text-indigo-600 dark:text-indigo-400"
                    : ""
                }`}
              >
                {format(day, "d")}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Plans */}
      {dayPlans.length === 0 ? (
        <motion.div
          variants={emptyState}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-dashed border-border/60 bg-card/50 p-8 text-center"
        >
          <motion.div variants={emptyChild}>
            <motion.div variants={emptyIconFloat} animate="animate">
              <Calendar className="mx-auto size-10 text-muted-foreground/30" />
            </motion.div>
          </motion.div>
          <motion.h3
            variants={emptyChild}
            className="mt-3 text-sm font-semibold"
          >
            No study plans for this day
          </motion.h3>
          <motion.p
            variants={emptyChild}
            className="mt-1 text-xs text-muted-foreground"
          >
            Create a plan to organize your study time
          </motion.p>
          <motion.div variants={emptyChild}>
            <Button
              onClick={() => {
                setForm({
                  ...form,
                  date: format(selectedDate, "yyyy-MM-dd"),
                });
                setShowForm(true);
              }}
              className="mt-3 gap-2"
              size="sm"
            >
              <Plus className="size-3.5" /> Add Plan
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={listContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {dayPlans.map((plan) => {
              const subject = subjects.find(
                (s) => s.id === plan.subjectId
              );
              return (
                <motion.div
                  key={plan.id}
                  layout
                  variants={listItem}
                  whileHover={{ y: -1 }}
                  className={`flex items-center gap-3 rounded-xl border bg-card p-3 transition-all ${
                    plan.completed
                      ? "opacity-60"
                      : "border-border/60"
                  }`}
                >
                  <motion.button
                    onClick={() => toggleComplete(plan)}
                    whileTap={{ scale: 1.2 }}
                    className="shrink-0"
                  >
                    {plan.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                      >
                        <CheckCircle2 className="size-5 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <Circle className="size-5 text-muted-foreground/40 hover:text-muted-foreground" />
                    )}
                  </motion.button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        plan.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {plan.topic}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {subject && (
                        <span
                          className="text-[11px]"
                          style={{ color: subject.color }}
                        >
                          {subject.name}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {plan.startTime} · {plan.duration}m
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          plan.priority === "high"
                            ? "bg-rose-100 text-rose-700"
                            : plan.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {plan.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="rounded p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) setShowForm(false);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Study Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Topic *</Label>
              <Input
                value={form.topic}
                onChange={(e) =>
                  setForm({ ...form, topic: e.target.value })
                }
                placeholder="What to study"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">No subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  value={form.duration}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                      form.priority === p
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
