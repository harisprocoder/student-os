import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { Mark } from "@/types";

export function useMarks() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.marks.toArray()).subscribe({
      next: (data) => {
        setMarks(data.sort((a, b) => b.date - a.date));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addMark = useCallback(
    async (data: Omit<Mark, "id" | "createdAt">) => {
      const mark: Mark = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await db.marks.add(mark);
      return mark;
    },
    []
  );

  const updateMark = useCallback(async (id: string, data: Partial<Omit<Mark, "id" | "createdAt">>) => {
    await db.marks.update(id, data);
  }, []);

  const deleteMark = useCallback(async (id: string) => {
    await db.marks.delete(id);
  }, []);

  const getSubjectMarks = useCallback(
    (subjectId: string) => {
      const subjectMarks = marks.filter((m) => m.subjectId === subjectId);
      const totalWeight = subjectMarks.reduce((sum, m) => sum + m.weight, 0);
      const weightedScore = subjectMarks.reduce(
        (sum, m) => sum + (m.marksObtained / m.totalMarks) * m.weight,
        0
      );
      const percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
      return { marks: subjectMarks, totalWeight, weightedScore, percentage };
    },
    [marks]
  );

  const getOverallGPA = useCallback(
    (gradeBoundaries?: { min: number; gpa: number }[]) => {
      const subjectIds = [...new Set(marks.map((m) => m.subjectId))];
      const subjectAverages = subjectIds.map((sid) => {
        const sm = marks.filter((m) => m.subjectId === sid);
        const tw = sm.reduce((s, m) => s + m.weight, 0);
        const ws = sm.reduce((s, m) => s + (m.marksObtained / m.totalMarks) * m.weight, 0);
        return tw > 0 ? (ws / tw) * 100 : 0;
      });

      if (!gradeBoundaries?.length) {
        return subjectAverages.length > 0
          ? subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length
          : 0;
      }

      const subjectGPAs = subjectAverages.map((pct) => {
        const boundary = gradeBoundaries.find((b) => pct >= b.min);
        return boundary?.gpa ?? 0;
      });
      return subjectGPAs.length > 0
        ? subjectGPAs.reduce((a, b) => a + b, 0) / subjectGPAs.length
        : 0;
    },
    [marks]
  );

  return { marks, loading, addMark, updateMark, deleteMark, getSubjectMarks, getOverallGPA };
}
