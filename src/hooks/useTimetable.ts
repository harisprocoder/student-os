import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { TimetableEntry } from "@/types";

export function useTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.timetable.toArray()).subscribe({
      next: (data) => {
        setEntries(data.sort((a, b) => a.day - b.day || a.startTime.localeCompare(b.startTime)));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addEntry = useCallback(
    async (data: Omit<TimetableEntry, "id" | "createdAt">) => {
      const entry: TimetableEntry = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await db.timetable.add(entry);
      return entry;
    },
    []
  );

  const updateEntry = useCallback(async (id: string, data: Partial<Omit<TimetableEntry, "id" | "createdAt">>) => {
    await db.timetable.update(id, data);
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await db.timetable.delete(id);
  }, []);

  return { entries, loading, addEntry, updateEntry, deleteEntry };
}
