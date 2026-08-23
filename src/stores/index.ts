import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  commandPaletteOpen: boolean;
  currentTheme: "light" | "dark" | "system";
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCurrentTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      mobileSidebarOpen: false,
      commandPaletteOpen: false,
      currentTheme: "system",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
    }),
    { name: "dae-ui" }
  )
);

interface TimerState {
  mode: "idle" | "focus" | "break" | "completed";
  timerPreset: "25_5" | "50_10" | "custom";
  focusDuration: number;
  breakDuration: number;
  startTimestamp: number | null;
  endTimestamp: number | null;
  completedSessions: number;
  subjectId: string | null;
  topic: string;
  setMode: (mode: TimerState["mode"]) => void;
  setTimerPreset: (preset: TimerState["timerPreset"]) => void;
  setFocusDuration: (min: number) => void;
  setBreakDuration: (min: number) => void;
  startTimer: (subjectId: string | null, topic: string, durationMin: number) => void;
  pauseTimer: () => void;
  resumeTimer: (remainingMs: number) => void;
  resetTimer: () => void;
  completeSession: () => void;
  getRemainingMs: () => number;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "idle",
      timerPreset: "25_5",
      focusDuration: 25,
      breakDuration: 5,
      startTimestamp: null,
      endTimestamp: null,
      completedSessions: 0,
      subjectId: null,
      topic: "",
      setMode: (mode) => set({ mode }),
      setTimerPreset: (preset) =>
        set({
          timerPreset: preset,
          focusDuration: preset === "25_5" ? 25 : preset === "50_10" ? 50 : get().focusDuration,
          breakDuration: preset === "25_5" ? 5 : preset === "50_10" ? 10 : get().breakDuration,
        }),
      setFocusDuration: (min) => set({ focusDuration: min }),
      setBreakDuration: (min) => set({ breakDuration: min }),
      startTimer: (subjectId, topic, durationMin) => {
        const now = Date.now();
        set({
          mode: "focus",
          subjectId,
          topic,
          startTimestamp: now,
          endTimestamp: now + durationMin * 60 * 1000,
        });
      },
      pauseTimer: () => {
        const remaining = get().getRemainingMs();
        set({ mode: "idle", endTimestamp: null, startTimestamp: null });
        void remaining;
      },
      resumeTimer: (remainingMs) => {
        const now = Date.now();
        set({
          mode: "focus",
          startTimestamp: now,
          endTimestamp: now + remainingMs,
        });
      },
      resetTimer: () =>
        set({
          mode: "idle",
          startTimestamp: null,
          endTimestamp: null,
          subjectId: null,
          topic: "",
        }),
      completeSession: () =>
        set((state) => ({
          mode: "completed",
          completedSessions: state.completedSessions + 1,
          startTimestamp: null,
          endTimestamp: null,
        })),
      getRemainingMs: () => {
        const { endTimestamp, mode } = get();
        if (!endTimestamp || mode === "idle" || mode === "completed") return 0;
        return Math.max(0, endTimestamp - Date.now());
      },
    }),
    { name: "dae-timer" }
  )
);

interface SettingsState {
  settingsLoaded: boolean;
  setSettingsLoaded: (loaded: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settingsLoaded: false,
  setSettingsLoaded: (loaded) => set({ settingsLoaded: loaded }),
}));
