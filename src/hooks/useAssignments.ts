import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Assignment } from "@/types";

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.assignments.toArray()).subscribe({
      next: (data) => {
        setAssignments(data.sort((a, b) => a.dueDate - b.dueDate));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addAssignment = useCallback(
    async (data: Omit<Assignment, "id" | "createdAt" | "updatedAt" | "completedAt">) => {
      const assignment: Assignment = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completedAt: null,
      };
      await db.assignments.add(assignment);
      return assignment;
    },
    []
  );

  const updateAssignment = useCallback(
    async (id: string, data: Partial<Omit<Assignment, "id" | "createdAt">>) => {
      await db.assignments.update(id, { ...data, updatedAt: Date.now() });
    },
    []
  );

  const deleteAssignment = useCallback(async (id: string) => {
    await db.assignments.delete(id);
  }, []);

  const toggleStatus = useCallback(
    async (id: string, status: Assignment["status"]) => {
      await db.assignments.update(id, {
        status,
        completedAt: status === "completed" ? Date.now() : null,
        updatedAt: Date.now(),
      });
    },
    []
  );

  return { assignments, loading, addAssignment, updateAssignment, deleteAssignment, toggleStatus };
}
