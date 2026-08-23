import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTimerStore } from "@/stores";
import { useSubjects } from "@/hooks/useSubjects";
import { db } from "@/db/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Timer } from "lucide-react";
import { toast } from "sonner";

const PRESETS = {
  "25_5": { focus: 25, break: 5, label: "Pomodoro" },
  "50_10": { focus: 50, break: 10, label: "Deep Focus" },
  custom: { focus: 25, break: 5, label: "Custom" },
};

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function StudyTimer() {
  const { subjects } = useSubjects();
  const store = useTimerStore();
  const [remaining, setRemaining] = useState(0);
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [showSetup, setShowSetup] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load today's total
  const loadTodayTotal = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessions = await db.studySessions.where("date").aboveOrEqual(today.getTime()).toArray();
    const total = sessions.filter((s) => s.completed).reduce((sum, s) => sum + s.duration, 0);
    setTodayTotal(total);
  }, []);

  useEffect(() => { loadTodayTotal(); }, [loadTodayTotal]);

  // Timer tick - timestamp based
  useEffect(() => {
    if (store.mode === "focus" || store.mode === "break") {
      const tick = () => {
        const rem = store.getRemainingMs();
        setRemaining(rem);
        if (rem <= 0) {
          if (store.mode === "focus") {
            // Session complete
            handleSessionComplete();
          }
          store.setMode(store.mode === "focus" ? "break" : "idle");
        }
      };
      tick();
      intervalRef.current = setInterval(tick, 250);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRemaining(0);
    }
  }, [store.mode, store.endTimestamp]);

  const handleSessionComplete = async () => {
    const duration = store.focusDuration;
    const now = Date.now();
    await db.studySessions.add({
      id: crypto.randomUUID(),
      subjectId: subjectId || null,
      topic: topic || "Study Session",
      date: now,
      startTime: now - duration * 60 * 1000,
      endTime: now,
      duration,
      mode: store.timerPreset === "25_5" ? "pomodoro_25" : store.timerPreset === "50_10" ? "pomodoro_50" : "custom",
      completed: true,
      createdAt: now,
    });
    store.completeSession();
    setShowComplete(true);
    setShowSetup(false);
    loadTodayTotal();
    toast.success("Study session complete! 🎉");
  };

  const startTimer = () => {
    const preset = PRESETS[store.timerPreset];
    const durationMin = store.timerPreset === "custom" ? store.focusDuration : preset.focus;
    store.startTimer(subjectId || null, topic || "Study Session", durationMin);
    setShowSetup(false);
  };

  const pauseTimer = () => {
    store.pauseTimer();
    setShowSetup(false);
  };

  const resumeTimer = () => {
    const rem = store.getRemainingMs();
    if (rem > 0) store.resumeTimer(rem);
  };

  const resetTimer = () => {
    store.resetTimer();
    setShowSetup(true);
    setShowComplete(false);
  };

  const skipSession = () => {
    if (store.mode === "focus") {
      handleSessionComplete();
    }
    store.resetTimer();
    setShowSetup(true);
    setShowComplete(false);
  };

  const circumference = 2 * Math.PI * 120;
  const focusDurationMs = (store.timerPreset === "custom" ? store.focusDuration : PRESETS[store.timerPreset].focus) * 60 * 1000;
  const progress = focusDurationMs > 0 ? 1 - remaining / focusDurationMs : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Study Timer</h1>
        <p className="text-sm text-muted-foreground">Focus sessions with Pomodoro technique</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Timer Display */}
        <div className="relative">
          <svg className="size-64 -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/50" />
            <circle
              cx="128" cy="128" r="120" fill="none"
              stroke="url(#timer-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-mono font-bold tracking-wider">
              {store.mode === "idle" && !showComplete
                ? formatTime(focusDurationMs)
                : formatTime(remaining)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {store.mode === "focus" ? "Focusing..." : store.mode === "break" ? "Break" : showComplete ? "Complete!" : "Ready to focus"}
            </p>
          </div>
        </div>

        {/* Session Complete */}
        {showComplete && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500 mb-2" />
            <h3 className="text-lg font-semibold">Study session complete 🎉</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {store.focusDuration} minutes studied · Today: {todayTotal + store.focusDuration}m
            </p>
            <Button onClick={() => { setShowComplete(false); setShowSetup(true); store.resetTimer(); }} className="mt-4">
              Start Another Session
            </Button>
          </motion.div>
        )}

        {/* Setup (when idle) */}
        {showSetup && store.mode === "idle" && !showComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="flex gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      store.setTimerPreset(key as keyof typeof PRESETS);
                      if (key !== "custom") {
                        store.setFocusDuration(preset.focus);
                        store.setBreakDuration(preset.break);
                      }
                    }}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                      store.timerPreset === key
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {store.timerPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Focus (min)</Label>
                  <Input type="number" min={1} value={store.focusDuration} onChange={(e) => store.setFocusDuration(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Break (min)</Label>
                  <Input type="number" min={1} value={store.breakDuration} onChange={(e) => store.setBreakDuration(Number(e.target.value))} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Subject</Label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="">No subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What are you studying?" />
            </div>

            <Button onClick={startTimer} className="w-full gap-2" size="lg">
              <Play className="size-4" /> Start Focus
            </Button>
          </motion.div>
        )}

        {/* Controls (when running) */}
        {(store.mode === "focus" || store.mode === "break") && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon-lg" onClick={resetTimer}>
              <RotateCcw className="size-5" />
            </Button>
            {store.mode === "focus" ? (
              <Button size="icon-lg" onClick={pauseTimer} className="rounded-full size-16">
                <Pause className="size-6" />
              </Button>
            ) : (
              <Button size="icon-lg" onClick={resumeTimer} className="rounded-full size-16">
                <Play className="size-6" />
              </Button>
            )}
            <Button variant="outline" size="icon-lg" onClick={skipSession}>
              <SkipForward className="size-5" />
            </Button>
          </div>
        )}

        {/* Paused state */}
        {store.mode === "idle" && !showSetup && !showComplete && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon-lg" onClick={resetTimer}>
              <RotateCcw className="size-5" />
            </Button>
            <Button size="icon-lg" onClick={resumeTimer} className="rounded-full size-16">
              <Play className="size-6" />
            </Button>
          </div>
        )}

        {/* Today's Stats */}
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-2xl font-bold">{todayTotal}m</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold">{store.completedSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
