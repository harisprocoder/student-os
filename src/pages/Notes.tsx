import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useSubjects } from "@/hooks/useSubjects";
import { useNotes } from "@/hooks/useNotes";
import {
  Plus,
  FileText,
  Search,
  Pin,
  Star,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Notes() {
  const { subjects } = useSubjects();
  const { notes, loading, deleteNote, updateNote } = useNotes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned" | "favorites">("all");
  const navigate = useNavigate();

  const filtered = notes.filter((n) => {
    if (n.archived) return false;
    if (filter === "pinned" && !n.pinned) return false;
    if (filter === "favorites" && !n.favorited) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await deleteNote(id);
    toast.success("Note deleted");
  };

  const togglePin = async (id: string, pinned: boolean) => {
    await updateNote(id, { pinned: !pinned });
  };

  const toggleFav = async (id: string, favorited: boolean) => {
    await updateNote(id, { favorited: !favorited });
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
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">{notes.filter((n) => !n.archived).length} notes</p>
        </div>
        <Button onClick={() => navigate("/notes/new")} className="gap-2">
          <Plus className="size-4" />
          New Note
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "pinned", "favorites"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center"
        >
          <FileText className="mx-auto size-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">
            {search ? "No notes found" : "Your workspace is empty"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term" : "Create your first note"}
          </p>
          {!search && (
            <Button onClick={() => navigate("/notes/new")} className="mt-4 gap-2">
              <Plus className="size-4" /> New Note
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => {
            const subject = subjects.find((s) => s.id === note.subjectId);
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold line-clamp-1">{note.title}</h3>
                  <div className="flex gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(note.id, note.pinned); }}
                      className={`rounded p-1 transition-colors ${note.pinned ? "text-indigo-500" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Pin className="size-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFav(note.id, note.favorited); }}
                      className={`rounded p-1 transition-colors ${note.favorited ? "text-amber-500" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Star className="size-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="rounded p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                  {note.content.replace(/[#*_`~\[\]]/g, "").slice(0, 120)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {subject && (
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: subject.color + "20", color: subject.color }}
                    >
                      {subject.name}
                    </span>
                  )}
                  {note.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
