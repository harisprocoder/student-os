import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Exam } from "@/types";

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.exams.toArray()).subscribe({
      next: (data) => {
        setExams(data.sort((a, b) => a.date - b.date));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addExam = useCallback(
    async (data: Omit<Exam, "id" | "createdAt" | "updatedAt">) => {
      const exam: Exam = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.exams.add(exam);
      return exam;
    },
    []
  );

  const updateExam = useCallback(
    async (id: string, data: Partial<Omit<Exam, "id" | "createdAt">>) => {
      await db.exams.update(id, { ...data, updatedAt: Date.now() });
    },
    []
  );

  const deleteExam = useCallback(async (id: string) => {
    await db.exams.delete(id);
  }, []);

  return { exams, loading, addExam, updateExam, deleteExam };
}
