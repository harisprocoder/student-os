import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/stores";
import { useSubjects } from "@/hooks/useSubjects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { db } from "@/db/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  timerPulse,
  timerControl,
  sessionComplete,
  successCheck,
  emptyState,
  emptyChild,
  emptyIconFloat,
  btnPrimary,
} from "@/lib/animations";

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

const CIRCUMFERENCE = 2 * Math.PI * 90;

export default function StudyTimer() {
  const { subjects } = useSubjects();
  const store = useTimerStore();
  const reduced = useReducedMotion();
  const [remaining, setRemaining] = useState(0);
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [showSetup, setShowSetup] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSessionCompleteRef = useRef<() => Promise<void>>(
    () => Promise.resolve()
  );

  const loadTodayTotal = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessions = await db.studySessions
      .where("date")
      .aboveOrEqual(today.getTime())
      .toArray();
    const total = sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
    setTodayTotal(total);
  }, []);

  const handleSessionComplete = useCallback(async () => {
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
      mode:
        store.timerPreset === "25_5"
          ? "pomodoro_25"
          : store.timerPreset === "50_10"
          ? "pomodoro_50"
          : "custom",
      completed: true,
      createdAt: now,
    });
    store.completeSession();
    setShowComplete(true);
    setShowSetup(false);
    loadTodayTotal();
    toast.success("Study session complete! 🎉");
  }, [store, subjectId, topic, loadTodayTotal]);

  handleSessionCompleteRef.current = handleSessionComplete;

  useEffect(() => {
    void loadTodayTotal();
  }, [loadTodayTotal]);

  // Timer tick - timestamp based
  useEffect(() => {
    if (store.mode === "focus" || store.mode === "break") {
      const tick = () => {
        const rem = store.getRemainingMs();
        setRemaining(rem);
        if (rem <= 0) {
          if (store.mode === "focus") {
            void handleSessionCompleteRef.current();
          }
          store.setMode(store.mode === "focus" ? "break" : "idle");
        }
      };
      tick();
      intervalRef.current = setInterval(tick, 250);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRemaining(0);
    }
  }, [store.mode, store.endTimestamp]);

  const startTimer = () => {
    const preset = PRESETS[store.timerPreset];
    const durationMin =
      store.timerPreset === "custom" ? store.focusDuration : preset.focus;
    store.startTimer(subjectId || null, topic || "Study Session", durationMin);
    setShowSetup(false);
  };

  const [pausedRemaining, setPausedRemaining] = useState(0);

  const pauseTimer = () => {
    const rem = store.getRemainingMs();
    setPausedRemaining(rem);
    store.pauseTimer();
  };

  const resumeTimer = () => {
    store.resumeTimer(pausedRemaining);
    setPausedRemaining(0);
  };

  const resetTimer = () => {
    store.resetTimer();
    setShowSetup(true);
    setShowComplete(false);
    setRemaining(0);
  };

  const skipTimer = () => {
    if (store.mode === "focus") {
      void handleSessionComplete();
    } else {
      store.setMode("idle");
      setShowSetup(true);
      setRemaining(0);
    }
  };

  const preset = PRESETS[store.timerPreset];
  const totalMs =
    (store.timerPreset === "custom" ? store.focusDuration : preset.focus) *
    60 *
    1000;
  const progress = totalMs > 0 ? ((totalMs - remaining) / totalMs) * 100 : 0;
  const strokeOffset = CIRCUMFERENCE * (1 - progress / 100);

  // Show setup
  if (showSetup) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-2xl font-bold tracking-tight">Study Timer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Focus mode for productive study sessions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="rounded-xl border border-border/60 bg-card p-6 space-y-6"
        >
          <div className="space-y-2">
            <Label>Timer Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map(
                (key) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => store.setTimerPreset(key)}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      store.timerPreset === key
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-600"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <p className="text-sm font-medium">{PRESETS[key].label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PRESETS[key].focus}/{PRESETS[key].break} min
                    </p>
                  </motion.button>
                )
              )}
            </div>
          </div>

          {store.timerPreset === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Label>Focus Duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={180}
                value={store.focusDuration}
                onChange={(e) =>
                  store.setFocusDuration(Number(e.target.value) || 25)
                }
              />
            </motion.div>
          )}

          <div className="space-y-2">
            <Label>Subject</Label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Topic (optional)</Label>
            <Input
              placeholder="What are you studying?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <motion.div variants={btnPrimary} initial="rest" whileHover="hover" whileTap="tap">
            <Button onClick={startTimer} className="w-full" size="lg">
              <Play className="size-4 mr-2" />
              Start Focus Session
            </Button>
          </motion.div>
        </motion.div>

        {todayTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/60 bg-card p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">Today's study time</p>
            <p className="text-2xl font-bold mt-1">{todayTotal} min</p>
          </motion.div>
        )}
      </div>
    );
  }

  // Show complete
  if (showComplete) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div
          variants={sessionComplete}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-border/60 bg-card p-8 text-center"
        >
          <motion.div
            variants={successCheck}
            initial="hidden"
            animate="visible"
          >
            <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
          </motion.div>
          <h2 className="text-xl font-bold mt-4">Session Complete!</h2>
          <p className="text-muted-foreground mt-2">
            Great work on your study session
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg bg-muted/50 p-3"
            >
              <p className="text-2xl font-bold">{store.focusDuration}m</p>
              <p className="text-xs text-muted-foreground">Focus Time</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg bg-muted/50 p-3"
            >
              <p className="text-2xl font-bold">{todayTotal}m</p>
              <p className="text-xs text-muted-foreground">Today Total</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Button onClick={resetTimer} size="lg">
              Back to Setup
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Show timer
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Study Timer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {store.mode === "focus" ? "Focusing" : "On Break"} · {preset.label}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: 0.1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="rounded-xl border border-border/60 bg-card p-8"
      >
        {/* Timer Display */}
        <div className="relative flex items-center justify-center">
          {/* Breathing pulse behind ring — only during active focus */}
          {store.mode === "focus" && !reduced && (
            <motion.div
              className="absolute size-52 rounded-full bg-indigo-500/20"
              variants={timerPulse}
              animate="animate"
            />
          )}

          <svg className="size-48 relative" viewBox="0 0 200 200">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            {/* Progress */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={
                store.mode === "focus"
                  ? "#6366f1"
                  : store.mode === "break"
                  ? "#10b981"
                  : "#94a3b8"
              }
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={`${strokeOffset}`}
              transform="rotate(-90 100 100)"
              style={{
                transition: reduced
                  ? "stroke-dashoffset 0.1s linear"
                  : "stroke-dashoffset 1s linear",
              }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-4xl font-bold font-mono tracking-tight">
              {formatTime(remaining)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {store.mode === "focus"
                ? "Focus"
                : store.mode === "break"
                ? "Break"
                : "Ready"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <motion.div
            variants={timerControl}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Button variant="outline" size="icon" onClick={resetTimer} title="Reset">
              <RotateCcw className="size-4" />
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            {store.mode === "focus" ? (
              <motion.div
                key="pause"
                variants={btnPrimary}
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button size="lg" onClick={pauseTimer} className="px-8">
                  <Pause className="size-4 mr-2" />
                  Pause
                </Button>
              </motion.div>
            ) : pausedRemaining > 0 ? (
              <motion.div
                key="resume"
                variants={btnPrimary}
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button size="lg" onClick={resumeTimer} className="px-8">
                  <Play className="size-4 mr-2" />
                  Resume
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="skip"
                variants={timerControl}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="outline" size="icon" onClick={skipTimer} title="Skip">
                  <SkipForward className="size-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={timerControl}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Button variant="outline" size="icon" onClick={skipTimer} title="Skip">
              <SkipForward className="size-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        Today: {todayTotal} min studied
      </motion.div>
    </div>
  );
}
