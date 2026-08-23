import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Goal } from "@/types";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.goals.toArray()).subscribe({
      next: (data) => {
        setGoals(data.sort((a, b) => a.deadline - b.deadline));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addGoal = useCallback(
    async (data: Omit<Goal, "id" | "createdAt" | "updatedAt" | "completed">) => {
      const goal: Goal = {
        ...data,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.goals.add(goal);
      return goal;
    },
    []
  );

  const updateGoal = useCallback(
    async (id: string, data: Partial<Omit<Goal, "id" | "createdAt">>) => {
      await db.goals.update(id, { ...data, updatedAt: Date.now() });
    },
    []
  );

  const deleteGoal = useCallback(async (id: string) => {
    await db.goals.delete(id);
  }, []);

  const getGoalProgress = useCallback((goal: Goal) => {
    if (goal.subtasks.length === 0) return goal.completed ? 100 : 0;
    const completed = goal.subtasks.filter((st) => st.completed).length;
    return Math.round((completed / goal.subtasks.length) * 100);
  }, []);

  return { goals, loading, addGoal, updateGoal, deleteGoal, getGoalProgress };
}
