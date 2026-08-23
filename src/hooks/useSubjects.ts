import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Subject } from "@/types";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.subjects.toArray()).subscribe({
      next: (data) => {
        setSubjects(data.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addSubject = useCallback(
    async (data: Omit<Subject, "id" | "createdAt" | "updatedAt">) => {
      const subject: Subject = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.subjects.add(subject);
      return subject;
    },
    []
  );

  const updateSubject = useCallback(
    async (id: string, data: Partial<Omit<Subject, "id" | "createdAt">>) => {
      await db.subjects.update(id, { ...data, updatedAt: Date.now() });
    },
    []
  );

  const deleteSubject = useCallback(async (id: string) => {
    await db.subjects.delete(id);
  }, []);

  return { subjects, loading, addSubject, updateSubject, deleteSubject };
}
