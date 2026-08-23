import { db } from "./database";
import type {
  Subject,
  Note,
  Assignment,
  TimetableEntry,
  AttendanceRecord,
  Exam,
  Mark,
  StudySession,
  Goal,
  Settings,
} from "@/types";
import { addDays, subDays, startOfWeek } from "date-fns";

const DEMO_SUBJECTS: Subject[] = [
  {
    id: crypto.randomUUID(),
    name: "Data Structures",
    code: "CS201",
    teacher: "Dr. Ahmed Khan",
    room: "Room 301",
    color: "#6366f1",
    icon: "database",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Operating Systems",
    code: "CS301",
    teacher: "Dr. Sara Malik",
    room: "Room 205",
    color: "#10b981",
    icon: "monitor",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Database Systems",
    code: "CS302",
    teacher: "Prof. Ali Hassan",
    room: "Lab 102",
    color: "#f59e0b",
    icon: "hard-drive",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Computer Networks",
    code: "CS303",
    teacher: "Dr. Fatima Noor",
    room: "Room 401",
    color: "#ef4444",
    icon: "wifi",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Software Engineering",
    code: "CS401",
    teacher: "Prof. Imran Ali",
    room: "Room 103",
    color: "#8b5cf6",
    icon: "code",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

function createDemoData(subjects: Subject[]) {
  const now = Date.now();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const notes: Note[] = [
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      title: "Binary Trees — Traversal Methods",
      content: `# Binary Trees\n\n## In-order Traversal\nVisit left subtree → root → right subtree\n\n## Pre-order Traversal\nVisit root → left subtree → right subtree\n\n## Post-order Traversal\nVisit left subtree → right subtree → root\n\n> Key insight: In-order traversal of a BST gives sorted order.\n\n\`\`\`python\ndef in_order(node):\n    if node:\n        in_order(node.left)\n        print(node.val)\n        in_order(node.right)\n\`\`\``,
      tags: ["trees", "algorithms"],
      folder: "Data Structures",
      pinned: true,
      favorited: false,
      archived: false,
      createdAt: subDays(now, 5).getTime(),
      updatedAt: subDays(now, 2).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[1].id,
      title: "Process Scheduling Algorithms",
      content: `# Process Scheduling\n\n## FCFS (First Come First Served)\nSimple queue-based scheduling.\n\n## SJF (Shortest Job First)\nOptimal average waiting time.\n\n## Round Robin\nEach process gets a time quantum.\n\n## Priority Scheduling\nEach process has a priority value.`,
      tags: ["os", "scheduling"],
      folder: "Operating Systems",
      pinned: false,
      favorited: true,
      archived: false,
      createdAt: subDays(now, 3).getTime(),
      updatedAt: subDays(now, 1).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[2].id,
      title: "SQL Joins Reference",
      content: `# SQL Joins\n\n| Join Type | Description |\n|-----------|-------------|\n| INNER | Matching rows only |\n| LEFT | All left + matching right |\n| RIGHT | All right + matching left |\n| FULL | All rows from both |\n\n\`\`\`sql\nSELECT * FROM students\nINNER JOIN grades ON students.id = grades.student_id;\n\`\`\``,
      tags: ["sql", "database"],
      folder: "Database Systems",
      pinned: false,
      favorited: false,
      archived: false,
      createdAt: subDays(now, 7).getTime(),
      updatedAt: subDays(now, 4).getTime(),
    },
  ];

  const assignments: Assignment[] = [
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      title: "Implement AVL Tree in C++",
      description: "Implement insert, delete, and search operations for an AVL tree with rotation logic.",
      dueDate: addDays(today, 2).getTime(),
      priority: "high",
      status: "in_progress",
      checklist: [
        { id: crypto.randomUUID(), text: "Implement rotation functions", completed: true },
        { id: crypto.randomUUID(), text: "Implement insert with balancing", completed: true },
        { id: crypto.randomUUID(), text: "Implement delete with balancing", completed: false },
        { id: crypto.randomUUID(), text: "Write test cases", completed: false },
      ],
      createdAt: subDays(now, 5).getTime(),
      updatedAt: now,
      completedAt: null,
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[1].id,
      title: "OS Assignment 3: Memory Management",
      description: "Solve page replacement algorithm problems (FIFO, LRU, Optimal).",
      dueDate: addDays(today, 4).getTime(),
      priority: "medium",
      status: "todo",
      checklist: [],
      createdAt: subDays(now, 3).getTime(),
      updatedAt: now,
      completedAt: null,
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[2].id,
      title: "Design ER Diagram for Library System",
      description: "Create a complete ER diagram with entities, relationships, and attributes for a library management system.",
      dueDate: addDays(today, 7).getTime(),
      priority: "low",
      status: "todo",
      checklist: [
        { id: crypto.randomUUID(), text: "Identify entities", completed: false },
        { id: crypto.randomUUID(), text: "Draw relationships", completed: false },
        { id: crypto.randomUUID(), text: "Add attributes and cardinalities", completed: false },
      ],
      createdAt: subDays(now, 2).getTime(),
      updatedAt: now,
      completedAt: null,
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[3].id,
      title: "Network Packet Analysis Report",
      description: "Use Wireshark to capture and analyze network packets for different protocols.",
      dueDate: addDays(today, 10).getTime(),
      priority: "medium",
      status: "todo",
      checklist: [],
      createdAt: subDays(now, 1).getTime(),
      updatedAt: now,
      completedAt: null,
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[4].id,
      title: "Agile Methodology Presentation",
      description: "Prepare a presentation on Scrum vs Kanban with real-world case studies.",
      dueDate: addDays(today, 5).getTime(),
      priority: "low",
      status: "completed",
      checklist: [
        { id: crypto.randomUUID(), text: "Research Scrum framework", completed: true },
        { id: crypto.randomUUID(), text: "Research Kanban framework", completed: true },
        { id: crypto.randomUUID(), text: "Create slides", completed: true },
      ],
      createdAt: subDays(now, 10).getTime(),
      updatedAt: subDays(now, 1).getTime(),
      completedAt: subDays(now, 1).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      title: "Graph Algorithms Lab",
      description: "Implement BFS and DFS with adjacency list representation.",
      dueDate: addDays(today, 14).getTime(),
      priority: "medium",
      status: "todo",
      checklist: [],
      createdAt: subDays(now, 1).getTime(),
      updatedAt: now,
      completedAt: null,
    },
  ];

  const timetable: TimetableEntry[] = [];
  const days = [1, 2, 3, 4, 5]; // Mon-Fri
  const times = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"];
  const endTimes = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];

  subjects.forEach((subject, i) => {
    const daySlots = [
      { day: days[i % 5], startIdx: 0 },
      { day: days[(i + 2) % 5], startIdx: 2 },
    ];
    daySlots.forEach(({ day, startIdx }) => {
      timetable.push({
        id: crypto.randomUUID(),
        subjectId: subject.id,
        day,
        startTime: times[startIdx],
        endTime: endTimes[startIdx],
        teacher: subject.teacher,
        room: subject.room,
        notes: "",
        createdAt: now,
      });
    });
  });

  const attendance: AttendanceRecord[] = [];
  subjects.forEach((subject) => {
    for (let i = 14; i >= 1; i--) {
      const date = subDays(today, i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const rand = Math.random();
      attendance.push({
        id: crypto.randomUUID(),
        subjectId: subject.id,
        date: date.getTime(),
        status: rand > 0.15 ? "present" : rand > 0.08 ? "late" : "absent",
        notes: "",
        createdAt: date.getTime(),
      });
    }
  });

  const exams: Exam[] = [
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      title: "Data Structures Midterm",
      date: addDays(today, 12).getTime(),
      time: "10:00",
      location: "Exam Hall A",
      syllabus: "Arrays, Linked Lists, Trees, Graphs, Hashing",
      preparationStatus: "in_progress",
      notes: "Focus on tree traversals and graph algorithms",
      createdAt: subDays(now, 10).getTime(),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[1].id,
      title: "Operating Systems Quiz",
      date: addDays(today, 3).getTime(),
      time: "09:00",
      location: "Room 205",
      syllabus: "Process management, CPU scheduling",
      preparationStatus: "not_started",
      notes: "",
      createdAt: subDays(now, 5).getTime(),
      updatedAt: now,
    },
  ];

  const marks: Mark[] = [
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      title: "DS Quiz 1",
      type: "quiz",
      marksObtained: 18,
      totalMarks: 20,
      weight: 10,
      date: subDays(now, 14).getTime(),
      notes: "",
      createdAt: subDays(now, 14).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      title: "DS Assignment 1",
      type: "assignment",
      marksObtained: 28,
      totalMarks: 30,
      weight: 15,
      date: subDays(now, 7).getTime(),
      notes: "",
      createdAt: subDays(now, 7).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[1].id,
      title: "OS Quiz 1",
      type: "quiz",
      marksObtained: 15,
      totalMarks: 20,
      weight: 10,
      date: subDays(now, 10).getTime(),
      notes: "",
      createdAt: subDays(now, 10).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[2].id,
      title: "DBMS Lab 1",
      type: "practical",
      marksObtained: 45,
      totalMarks: 50,
      weight: 20,
      date: subDays(now, 5).getTime(),
      notes: "",
      createdAt: subDays(now, 5).getTime(),
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: crypto.randomUUID(),
      subjectId: subjects[0].id,
      topic: "Binary Trees Practice",
      date: subDays(now, 1).getTime(),
      startTime: subDays(now, 1).getTime(),
      endTime: subDays(now, 1).getTime() + 25 * 60 * 1000,
      duration: 25,
      mode: "pomodoro_25",
      completed: true,
      createdAt: subDays(now, 1).getTime(),
    },
    {
      id: crypto.randomUUID(),
      subjectId: subjects[1].id,
      topic: "Process Scheduling Review",
      date: subDays(now, 2).getTime(),
      startTime: subDays(now, 2).getTime(),
      endTime: subDays(now, 2).getTime() + 50 * 60 * 1000,
      duration: 50,
      mode: "pomodoro_50",
      completed: true,
      createdAt: subDays(now, 2).getTime(),
    },
  ];

  const goals: Goal[] = [
    {
      id: crypto.randomUUID(),
      title: "Master All Tree Algorithms",
      description: "Complete study of BST, AVL, Red-Black trees, and heap operations",
      deadline: addDays(today, 20).getTime(),
      priority: "high",
      subtasks: [
        { id: crypto.randomUUID(), text: "BST operations and traversals", completed: true },
        { id: crypto.randomUUID(), text: "AVL tree rotations", completed: true },
        { id: crypto.randomUUID(), text: "Red-Black tree insertion", completed: false },
        { id: crypto.randomUUID(), text: "Heap operations", completed: false },
      ],
      completed: false,
      createdAt: subDays(now, 10).getTime(),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Achieve 90% Attendance",
      description: "Maintain excellent attendance across all subjects this semester",
      deadline: addDays(today, 90).getTime(),
      priority: "medium",
      subtasks: [
        { id: crypto.randomUUID(), text: "Attend all classes this week", completed: true },
        { id: crypto.randomUUID(), text: "No absences for 2 weeks", completed: false },
      ],
      completed: false,
      createdAt: subDays(now, 15).getTime(),
      updatedAt: now,
    },
  ];

  return {
    subjects,
    notes,
    assignments,
    timetable,
    attendance,
    exams,
    marks,
    studySessions,
    goals,
  };
}

export async function loadDemoData(): Promise<void> {
  const demoData = createDemoData(DEMO_SUBJECTS);

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
      db.goals,
    ],
    async () => {
      await db.subjects.clear();
      await db.notes.clear();
      await db.assignments.clear();
      await db.timetable.clear();
      await db.attendance.clear();
      await db.exams.clear();
      await db.marks.clear();
      await db.studySessions.clear();
      await db.goals.clear();

      await db.subjects.bulkAdd(demoData.subjects);
      await db.notes.bulkAdd(demoData.notes);
      await db.assignments.bulkAdd(demoData.assignments);
      await db.timetable.bulkAdd(demoData.timetable);
      await db.attendance.bulkAdd(demoData.attendance);
      await db.exams.bulkAdd(demoData.exams);
      await db.marks.bulkAdd(demoData.marks);
      await db.studySessions.bulkAdd(demoData.studySessions);
      await db.goals.bulkAdd(demoData.goals);
    }
  );
}

export async function clearDemoData(): Promise<void> {
  await Promise.all([
    db.subjects.clear(),
    db.notes.clear(),
    db.assignments.clear(),
    db.timetable.clear(),
    db.attendance.clear(),
    db.exams.clear(),
    db.marks.clear(),
    db.studySessions.clear(),
    db.goals.clear(),
  ]);
}
