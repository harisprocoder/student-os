import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/database";
import type { AttendanceRecord } from "@/types";

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = liveQuery(() => db.attendance.toArray()).subscribe({
      next: (data) => {
        setRecords(data.sort((a, b) => b.date - a.date));
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  const addRecord = useCallback(
    async (data: Omit<AttendanceRecord, "id" | "createdAt">) => {
      const record: AttendanceRecord = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await db.attendance.add(record);
      return record;
    },
    []
  );

  const deleteRecord = useCallback(async (id: string) => {
    await db.attendance.delete(id);
  }, []);

  const getSubjectAttendance = useCallback(
    (subjectId: string) => {
      const subjectRecords = records.filter((r) => r.subjectId === subjectId);
      const total = subjectRecords.length;
      const present = subjectRecords.filter((r) => r.status === "present").length;
      const absent = subjectRecords.filter((r) => r.status === "absent").length;
      const late = subjectRecords.filter((r) => r.status === "late").length;
      const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;
      return { total, present, absent, late, percentage };
    },
    [records]
  );

  const getOverallAttendance = useCallback(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;
    return { total, present, absent, late, percentage };
  }, [records]);

  return {
    records,
    loading,
    addRecord,
    deleteRecord,
    getSubjectAttendance,
    getOverallAttendance,
  };
}
