import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { StudySession } from "@/types";

export function useStudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.studySessions.toArray()).subscribe({
      next: (data) => {
        setSessions(data.sort((a, b) => b.date - a.date));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addSession = useCallback(
    async (data: Omit<StudySession, "id" | "createdAt">) => {
      const session: StudySession = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await db.studySessions.add(session);
      return session;
    },
    []
  );

  const deleteSession = useCallback(async (id: string) => {
    await db.studySessions.delete(id);
  }, []);

  const getTodayTotal = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => s.date >= today.getTime() && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const getWeeklyTotal = useCallback(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions
      .filter((s) => s.date >= weekAgo && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const getSubjectTotal = useCallback(
    (subjectId: string) => {
      return sessions
        .filter((s) => s.subjectId === subjectId && s.completed)
        .reduce((sum, s) => sum + s.duration, 0);
    },
    [sessions]
  );

  return { sessions, loading, addSession, deleteSession, getTodayTotal, getWeeklyTotal, getSubjectTotal };
}
