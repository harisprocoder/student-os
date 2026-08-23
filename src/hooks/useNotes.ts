import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Note } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.notes.toArray()).subscribe({
      next: (data) => {
        setNotes(data.sort((a, b) => b.updatedAt - a.updatedAt));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addNote = useCallback(
    async (data: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      const note: Note = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.notes.add(note);
      return note;
    },
    []
  );

  const updateNote = useCallback(
    async (id: string, data: Partial<Omit<Note, "id" | "createdAt">>) => {
      await db.notes.update(id, { ...data, updatedAt: Date.now() });
    },
    []
  );

  const deleteNote = useCallback(async (id: string) => {
    await db.notes.delete(id);
  }, []);

  return { notes, loading, addNote, updateNote, deleteNote };
}
