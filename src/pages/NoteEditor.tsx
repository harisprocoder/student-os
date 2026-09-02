import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotes } from "@/hooks/useNotes";
import { useSubjects } from "@/hooks/useSubjects";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, Edit3, Save } from "lucide-react";
import { toast } from "sonner";

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote } = useNotes();
  const { subjects } = useSubjects();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [folder, setFolder] = useState("");
  const [tags, setTags] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isLoaded, setIsLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  // Load existing note or initialize new one
  useEffect(() => {
    if (isInitialized.current) return;
    if (id) {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const { title, content, subjectId, folder, tags } = note;
        setTitle(title);
        setContent(content);
        setSubjectId(subjectId || "");
        setFolder(folder);
        setTags(tags.join(", "));
        setIsLoaded(true);
        isInitialized.current = true;
      }
    } else {
      setIsLoaded(true);
      isInitialized.current = true;
    }
  }, [id, notes]);

  const save = useCallback(
    async (data: { title: string; content: string; subjectId: string | null; folder: string; tags: string[] }) => {
      setSaveStatus("saving");
      try {
        if (id) {
          await updateNote(id, data);
        } else {
          const newNote = await addNote({
            ...data,
            pinned: false,
            favorited: false,
            archived: false,
          });
          // Navigate to the new note URL
          navigate(`/dashboard/notes/${newNote.id}`, { replace: true });
          // Update the ref to prevent re-initialization
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      } catch {
        setSaveStatus("idle");
        toast.error("Failed to save");
      }
    },
    [id, addNote, updateNote, navigate]
  );

  // Autosave with debounce
  useEffect(() => {
    if (!isLoaded || !id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save({
        title: title || "Untitled",
        content,
        subjectId: subjectId || null,
        folder,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, subjectId, folder, tags, isLoaded, id, save]);

  // Handle new note creation on first save
  useEffect(() => {
    if (!id && isLoaded && (title || content)) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          const newNote = await addNote({
            title: title || "Untitled",
            content,
            subjectId: subjectId || null,
            folder,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            pinned: false,
            favorited: false,
            archived: false,
          });
          navigate(`/dashboard/notes/${newNote.id}`, { replace: true });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        } catch {
          setSaveStatus("idle");
        }
      }, 1500);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }
  }, [title, content, subjectId, folder, tags, isLoaded, id, addNote, navigate]);

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/notes")}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">
              {id ? "Edit Note" : "New Note"}
            </h1>
            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <div className="size-2 rounded-full bg-amber-500 animate-pulse" /> Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                >
                  <Save className="size-3" /> Saved ✓
                </motion.span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-xs"
          >
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-border/60 bg-muted/50 p-0.5">
            <button
              onClick={() => setMode("edit")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                mode === "edit" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <Edit3 className="size-3.5 mr-1 inline" /> Edit
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                mode === "preview" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <Eye className="size-3.5 mr-1 inline" /> Preview
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 px-0 h-auto"
      />

      {/* Meta */}
      <div className="flex items-center gap-3">
        <Input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Folder"
          className="h-8 w-32 text-xs"
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="h-8 text-xs"
        />
      </div>

      {/* Editor / Preview */}
      <div className="min-h-[500px] rounded-xl border border-border/60 bg-card">
        {mode === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in Markdown..."
            className="w-full min-h-[500px] resize-none bg-transparent p-4 text-sm font-mono focus:outline-none leading-relaxed"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none p-4">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
