import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useSubjects } from "@/hooks/useSubjects";
import { useAttendance } from "@/hooks/useAttendance";
import { useAssignments } from "@/hooks/useAssignments";
import { Plus, BookOpen, Pencil, Trash2, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  emptyState,
  emptyChild,
  emptyIconFloat,
  cardHover,
  subjectAccentBar,
  subjectIcon,
  btnPrimary,
  fab,
  listContainer,
} from "@/lib/animations";

const SUBJECT_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#3b82f6",
  "#06b6d4",
];

const gridContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] as const },
  },
};

export default function Subjects() {
  const {
    subjects,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();
  const { getSubjectAttendance } = useAttendance();
  const { assignments } = useAssignments();
  const [showAdd, setShowAdd] = useState(false);
  const [editSubject, setEditSubject] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    teacher: "",
    room: "",
    color: SUBJECT_COLORS[0],
    icon: "book-open",
  });

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      teacher: "",
      room: "",
      color: SUBJECT_COLORS[0],
      icon: "book-open",
    });
    setEditSubject(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    try {
      if (editSubject) {
        await updateSubject(editSubject, form);
        toast.success("Subject updated");
      } else {
        await addSubject(form);
        toast.success("Subject added");
      }
      setShowAdd(false);
      resetForm();
    } catch {
      toast.error("Failed to save subject");
    }
  };

  const handleEdit = (id: string) => {
    const s = subjects.find((sub) => sub.id === id);
    if (!s) return;
    setForm({
      name: s.name,
      code: s.code,
      teacher: s.teacher,
      room: s.room,
      color: s.color,
      icon: s.icon,
    });
    setEditSubject(id);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject and all related data?")) return;
    await deleteSubject(id);
    toast.success("Subject deleted");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            {subjects.length} subjects
          </p>
        </div>
        <motion.div variants={btnPrimary} initial="rest" whileHover="hover" whileTap="tap">
          <Button
            onClick={() => {
              resetForm();
              setShowAdd(true);
            }}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Subject
          </Button>
        </motion.div>
      </div>

      {subjects.length === 0 ? (
        <motion.div
          variants={emptyState}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center"
        >
          <motion.div variants={emptyChild}>
            <motion.div variants={emptyIconFloat} animate="animate">
              <BookOpen className="mx-auto size-12 text-muted-foreground/30" />
            </motion.div>
          </motion.div>
          <motion.h3
            variants={emptyChild}
            className="mt-4 text-lg font-semibold"
          >
            No subjects yet
          </motion.h3>
          <motion.p
            variants={emptyChild}
            className="mt-1 text-sm text-muted-foreground"
          >
            Add your first subject to get started
          </motion.p>
          <motion.div variants={emptyChild}>
            <Button
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              className="mt-4 gap-2"
            >
              <Plus className="size-4" />
              Add Subject
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {subjects.map((subject) => {
              const att = getSubjectAttendance(subject.id);
              const pending = assignments.filter(
                (a) =>
                  a.subjectId === subject.id && a.status !== "completed"
              ).length;

              return (
                <motion.div
                  key={subject.id}
                  layout
                  variants={gridItem}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  whileTap="tap"
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-card"
                >
                  {/* Accent bar */}
                  <motion.div
                    className="absolute left-0 top-0 w-1 rounded-r-full"
                    style={{ backgroundColor: subject.color }}
                    variants={subjectAccentBar}
                    initial="rest"
                    whileHover="hover"
                  />

                  <div className="p-4 pl-5">
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/subjects/${subject.id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <motion.div
                            variants={subjectIcon}
                            initial="rest"
                            whileHover="hover"
                            className="flex size-9 items-center justify-center rounded-lg text-white text-sm font-bold"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name[0]}
                          </motion.div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {subject.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subject.code}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => handleEdit(subject.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {subject.teacher && (
                        <p className="text-xs text-muted-foreground">
                          {subject.teacher}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-4 border-t border-border/40 pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="size-3.5" />
                        <span>{att.percentage.toFixed(0)}% attendance</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ClipboardList className="size-3.5" />
                        <span>{pending} pending</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog
        open={showAdd}
        onOpenChange={(open) => {
          if (!open) {
            setShowAdd(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editSubject ? "Edit Subject" : "Add Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Data Structures"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. CS201"
                />
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Input
                  value={form.teacher}
                  onChange={(e) =>
                    setForm({ ...form, teacher: e.target.value })
                  }
                  placeholder="e.g. Dr. Khan"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. Room 301"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`size-7 rounded-full transition-all ${
                      form.color === c
                        ? "ring-2 ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editSubject ? "Save Changes" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAB for mobile */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 sm:hidden"
        variants={fab}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          size="icon"
          className="size-14 rounded-full shadow-lg bg-indigo-500 hover:bg-indigo-600"
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
        >
          <Plus className="size-6" />
        </Button>
      </motion.div>
    </div>
  );
}
