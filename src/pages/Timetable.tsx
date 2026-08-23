import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimetable } from "@/hooks/useTimetable";
import { useSubjects } from "@/hooks/useSubjects";
import type { TimetableEntry } from "@/types";
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
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  listContainer,
  scheduleItem,
  emptyState,
  emptyChild,
  emptyIconFloat,
  btnPrimary,
} from "@/lib/animations";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Timetable() {
  const { entries, loading, addEntry, updateEntry, deleteEntry } =
    useTimetable();
  const { subjects } = useSubjects();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subjectId: "",
    day: new Date().getDay(),
    startTime: "09:00",
    endTime: "10:00",
    teacher: "",
    room: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      subjectId: "",
      day: new Date().getDay(),
      startTime: "09:00",
      endTime: "10:00",
      teacher: "",
      room: "",
      notes: "",
    });
    setEditId(null);
  };

  const dayEntries = entries
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSave = async () => {
    if (!form.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    const subject = subjects.find((s) => s.id === form.subjectId);
    const data = {
      ...form,
      teacher: form.teacher || subject?.teacher || "",
      room: form.room || subject?.room || "",
    };
    try {
      if (editId) {
        await updateEntry(editId, data);
        toast.success("Entry updated");
      } else {
        await addEntry(data);
        toast.success("Entry added");
      }
      setShowForm(false);
      resetForm();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setForm({
      subjectId: entry.subjectId,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      teacher: entry.teacher,
      room: entry.room,
      notes: entry.notes,
    });
    setEditId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timetable entry?")) return;
    await deleteEntry(id);
    toast.success("Entry deleted");
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
          <h1 className="text-2xl font-bold tracking-tight">Timetable</h1>
          <p className="text-sm text-muted-foreground">
            {entries.length} classes scheduled
          </p>
        </div>
        <motion.div variants={btnPrimary} initial="rest" whileHover="hover" whileTap="tap">
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="size-4" /> Add Class
          </Button>
        </motion.div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {DAYS.map((day, i) => (
          <motion.button
            key={i}
            onClick={() => setSelectedDay(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
              selectedDay === i
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {SHORT_DAYS[i]}
          </motion.button>
        ))}
      </div>

      {/* Schedule */}
      {dayEntries.length === 0 ? (
        <motion.div
          variants={emptyState}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center"
        >
          <motion.div variants={emptyChild}>
            <motion.div variants={emptyIconFloat} animate="animate">
              <Calendar className="mx-auto size-12 text-muted-foreground/30" />
            </motion.div>
          </motion.div>
          <motion.h3
            variants={emptyChild}
            className="mt-4 text-lg font-semibold"
          >
            No classes on {DAYS[selectedDay]}
          </motion.h3>
          <motion.p
            variants={emptyChild}
            className="mt-1 text-sm text-muted-foreground"
          >
            Add a class to this day
          </motion.p>
          <motion.div variants={emptyChild}>
            <Button
              onClick={() => {
                resetForm();
                setForm({ ...form, day: selectedDay });
                setShowForm(true);
              }}
              className="mt-4 gap-2"
            >
              <Plus className="size-4" /> Add Class
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
            {dayEntries.map((entry, idx) => {
              const subject = subjects.find(
                (s) => s.id === entry.subjectId
              );
              const now = new Date();
              const [sh, sm] = entry.startTime.split(":").map(Number);
              const [eh, em] = entry.endTime.split(":").map(Number);
              const entryStart = new Date(now);
              entryStart.setHours(sh, sm, 0, 0);
              const entryEnd = new Date(now);
              entryEnd.setHours(eh, em, 0, 0);
              const isCurrent =
                now >= entryStart &&
                now <= entryEnd &&
                selectedDay === now.getDay();

              return (
                <motion.div
                  key={entry.id}
                  layout
                  variants={scheduleItem}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? "border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm"
                      : "border-border/60 bg-card"
                  }`}
                >
                  {isCurrent && (
                    <motion.div
                      className="size-2 rounded-full bg-indigo-500 shrink-0"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  <div className="w-20 shrink-0 text-center">
                    <p className="text-sm font-mono font-medium">
                      {entry.startTime}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      to {entry.endTime}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            subject?.color || "#6366f1",
                        }}
                      />
                      <p className="text-sm font-medium truncate">
                        {subject?.name || "Unknown"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.teacher && `${entry.teacher} · `}
                      {entry.room}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Class" : "Add Class"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Day *</Label>
              <select
                value={form.day}
                onChange={(e) =>
                  setForm({ ...form, day: Number(e.target.value) })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Input
                  value={form.teacher}
                  onChange={(e) =>
                    setForm({ ...form, teacher: e.target.value })
                  }
                  placeholder="Auto-filled"
                />
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input
                  value={form.room}
                  onChange={(e) =>
                    setForm({ ...form, room: e.target.value })
                  }
                  placeholder="Auto-filled"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>{editId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
