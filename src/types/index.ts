export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  room: string;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  subjectId: string | null;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  pinned: boolean;
  favorited: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Assignment {
  id: string;
  subjectId: string | null;
  title: string;
  description: string;
  dueDate: number;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
  checklist: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  day: number; // 0=Sunday, 6=Saturday
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  teacher: string;
  room: string;
  notes: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: number;
  status: "present" | "absent" | "late";
  notes: string;
  createdAt: number;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: number;
  time: string;
  location: string;
  syllabus: string;
  preparationStatus: "not_started" | "in_progress" | "ready";
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Mark {
  id: string;
  subjectId: string;
  title: string;
  type: "quiz" | "assignment" | "midterm" | "final" | "practical" | "custom";
  marksObtained: number;
  totalMarks: number;
  weight: number;
  date: number;
  notes: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string | null;
  topic: string;
  date: number;
  startTime: number;
  endTime: number;
  duration: number; // minutes
  mode: "pomodoro_25" | "pomodoro_50" | "custom";
  completed: boolean;
  createdAt: number;
}

export interface StudyPlan {
  id: string;
  subjectId: string | null;
  topic: string;
  date: number;
  startTime: string;
  duration: number; // minutes
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: number;
  priority: "low" | "medium" | "high";
  subtasks: Subtask[];
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Settings {
  id: string;
  theme: "light" | "dark" | "system";
  userName: string;
  program: string;
  semester: string;
  attendanceTarget: number;
  timerFocusDuration: number;
  timerBreakDuration: number;
  timeFormat: "12h" | "24h";
  weekStartDay: number;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  updatedAt: number;
}

export interface GradeBoundary {
  min: number;
  max: number;
  grade: string;
  gpa: number;
}

export type AppTheme = "light" | "dark" | "system";
