import Dexie, { type EntityTable } from "dexie";
import type {
  Subject,
  Note,
  Assignment,
  TimetableEntry,
  AttendanceRecord,
  Exam,
  Mark,
  StudySession,
  StudyPlan,
  Goal,
  Settings,
} from "@/types";

class StudentOSDatabase extends Dexie {
  subjects!: EntityTable<Subject, "id">;
  notes!: EntityTable<Note, "id">;
  assignments!: EntityTable<Assignment, "id">;
  timetable!: EntityTable<TimetableEntry, "id">;
  attendance!: EntityTable<AttendanceRecord, "id">;
  exams!: EntityTable<Exam, "id">;
  marks!: EntityTable<Mark, "id">;
  studySessions!: EntityTable<StudySession, "id">;
  studyPlans!: EntityTable<StudyPlan, "id">;
  goals!: EntityTable<Goal, "id">;
  settings!: EntityTable<Settings, "id">;

  constructor() {
    super("dae-student-os");
    this.version(1).stores({
      subjects: "id, name, code, createdAt",
      notes: "id, subjectId, title, pinned, favorited, archived, createdAt, updatedAt",
      assignments: "id, subjectId, status, priority, dueDate, createdAt",
      timetable: "id, subjectId, day",
      attendance: "id, subjectId, date, status",
      exams: "id, subjectId, date, preparationStatus",
      marks: "id, subjectId, type, date",
      studySessions: "id, subjectId, date, completed",
      studyPlans: "id, subjectId, date, completed",
      goals: "id, deadline, completed, priority",
      settings: "id",
    });
  }
}

export const db = new StudentOSDatabase();

export async function initializeSettings(): Promise<Settings> {
  const existing = await db.settings.get("default");
  if (existing) return existing;
  const settings: Settings = {
    id: "default",
    theme: "system",
    userName: "",
    program: "",
    semester: "",
    attendanceTarget: 75,
    timerFocusDuration: 25,
    timerBreakDuration: 5,
    timeFormat: "12h",
    weekStartDay: 1,
    notificationsEnabled: false,
    onboardingCompleted: false,
    updatedAt: Date.now(),
  };
  await db.settings.add(settings);
  return settings;
}

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get("default");
  if (existing) return existing;
  return initializeSettings();
}

export async function updateSettings(
  updates: Partial<Omit<Settings, "id">>
): Promise<Settings> {
  const current = await getSettings();
  const updated: Settings = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
  };
  await db.settings.put(updated);
  return updated;
}

export async function exportAllData() {
  const [
    subjects,
    notes,
    assignments,
    timetable,
    attendance,
    exams,
    marks,
    studySessions,
    studyPlans,
    goals,
    settings,
  ] = await Promise.all([
    db.subjects.toArray(),
    db.notes.toArray(),
    db.assignments.toArray(),
    db.timetable.toArray(),
    db.attendance.toArray(),
    db.exams.toArray(),
    db.marks.toArray(),
    db.studySessions.toArray(),
    db.studyPlans.toArray(),
    db.goals.toArray(),
    db.settings.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: Date.now(),
    data: {
      subjects,
      notes,
      assignments,
      timetable,
      attendance,
      exams,
      marks,
      studySessions,
      studyPlans,
      goals,
      settings,
    },
  };
}

interface BackupData {
  version: number;
  exportedAt: number;
  data: {
    subjects: Subject[];
    notes: Note[];
    assignments: Assignment[];
    timetable: TimetableEntry[];
    attendance: AttendanceRecord[];
    exams: Exam[];
    marks: Mark[];
    studySessions: StudySession[];
    studyPlans: StudyPlan[];
    goals: Goal[];
    settings: Settings[];
  };
}

export async function importAllData(
  backup: BackupData
): Promise<boolean> {
  if (!backup?.data || backup.version === undefined) {
    throw new Error("Invalid backup file");
  }

  const { data } = backup;

  await db.transaction(
    "rw",
    [
      db.subjects,
      db.notes,
      db.assignments,
      db.timetable,
      db.attendance,
      db.exams,
      db.marks,
      db.studySessions,
      db.studyPlans,
      db.goals,
      db.settings,
    ],
    async () => {
      await Promise.all([
        db.subjects.clear(),
        db.notes.clear(),
        db.assignments.clear(),
        db.timetable.clear(),
        db.attendance.clear(),
        db.exams.clear(),
        db.marks.clear(),
        db.studySessions.clear(),
        db.studyPlans.clear(),
        db.goals.clear(),
        db.settings.clear(),
      ]);

      if (data.subjects?.length) await db.subjects.bulkAdd(data.subjects);
      if (data.notes?.length) await db.notes.bulkAdd(data.notes);
      if (data.assignments?.length) await db.assignments.bulkAdd(data.assignments);
      if (data.timetable?.length) await db.timetable.bulkAdd(data.timetable);
      if (data.attendance?.length) await db.attendance.bulkAdd(data.attendance);
      if (data.exams?.length) await db.exams.bulkAdd(data.exams);
      if (data.marks?.length) await db.marks.bulkAdd(data.marks);
      if (data.studySessions?.length)
        await db.studySessions.bulkAdd(data.studySessions);
      if (data.studyPlans?.length) await db.studyPlans.bulkAdd(data.studyPlans);
      if (data.goals?.length) await db.goals.bulkAdd(data.goals);
      if (data.settings?.length) await db.settings.bulkAdd(data.settings);
    }
  );

  return true;
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.subjects.clear(),
    db.notes.clear(),
    db.assignments.clear(),
    db.timetable.clear(),
    db.attendance.clear(),
    db.exams.clear(),
    db.marks.clear(),
    db.studySessions.clear(),
    db.studyPlans.clear(),
    db.goals.clear(),
    db.settings.clear(),
  ]);
}

export async function getStorageEstimate(): Promise<{
  used: number;
  quota: number;
}> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { used: 0, quota: 0 };
}
