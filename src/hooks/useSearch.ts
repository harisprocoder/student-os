import { useState, useCallback } from "react";
import { db } from "@/db/database";


interface SearchResult {
  type: "subject" | "note" | "assignment" | "exam" | "goal";
  id: string;
  title: string;
  subtitle: string;
  path: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const q = query.toLowerCase();

    try {
      const [subjects, notes, assignments, exams, goals] = await Promise.all([
        db.subjects.toArray(),
        db.notes.toArray(),
        db.assignments.toArray(),
        db.exams.toArray(),
        db.goals.toArray(),
      ]);

      const found: SearchResult[] = [];

      subjects
        .filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
        .forEach((s) =>
          found.push({ type: "subject", id: s.id, title: s.name, subtitle: s.code, path: `/dashboard/subjects/${s.id}` })
        );

      notes
        .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
        .forEach((n) =>
          found.push({ type: "note", id: n.id, title: n.title, subtitle: n.folder || "Notes", path: `/dashboard/notes?edit=${n.id}` })
        );

      assignments
        .filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
        .forEach((a) =>
          found.push({ type: "assignment", id: a.id, title: a.title, subtitle: a.status, path: `/dashboard/assignments` })
        );

      exams
        .filter((e) => e.title.toLowerCase().includes(q) || e.syllabus.toLowerCase().includes(q))
        .forEach((e) =>
          found.push({ type: "exam", id: e.id, title: e.title, subtitle: e.syllabus.slice(0, 50), path: `/dashboard/exams` })
        );

      goals
        .filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
        .forEach((g) =>
          found.push({ type: "goal", id: g.id, title: g.title, subtitle: g.description.slice(0, 50), path: `/dashboard/goals` })
        );

      setResults(found.slice(0, 20));
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, searching, search, clearResults };
}
