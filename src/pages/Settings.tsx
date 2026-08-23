import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores";
import { getSettings, updateSettings, exportAllData, importAllData, clearAllData, getStorageEstimate } from "@/db/database";
import { loadDemoData, clearDemoData } from "@/db/seed";
import type { Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  Trash2,
  Database,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [storage, setStorage] = useState({ used: 0, quota: 0 });
  const { setCurrentTheme } = useUIStore();

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettings(s);
      const est = await getStorageEstimate();
      setStorage(est);
    })();
  }, []);

  const update = async (updates: Partial<Omit<Settings, "id">>) => {
    if (!settings) return;
    const updated = await updateSettings(updates);
    setSettings(updated);
    if (updates.theme) setCurrentTheme(updates.theme);
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dae-student-os-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported successfully");
    } catch {
      toast.error("Failed to export backup");
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!confirm("This will replace all current data. Continue?")) return;
        await importAllData(data as any);
        toast.success("Backup restored successfully");
        window.location.reload();
      } catch {
        toast.error("Invalid backup file");
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!confirm("This will permanently delete all your data. This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;
    await clearAllData();
    toast.success("All data cleared");
    window.location.reload();
  };

  const handleLoadDemo = async () => {
    if (!confirm("This will clear existing data and load demo data. Continue?")) return;
    await clearDemoData();
    await loadDemoData();
    toast.success("Demo data loaded!");
    window.location.reload();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (!settings) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your workspace</p>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Appearance</h2>
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => update({ theme: value })}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                  settings.theme === value
                    ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input value={settings.userName} onChange={(e) => update({ userName: e.target.value })} placeholder="Student" />
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Input value={settings.program} onChange={(e) => update({ program: e.target.value })} placeholder="BS Computer Science" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Semester</Label>
              <Input value={settings.semester} onChange={(e) => update({ semester: e.target.value })} placeholder="5th Semester" />
            </div>
            <div className="space-y-2">
              <Label>Attendance Target (%)</Label>
              <Input type="number" min={0} max={100} value={settings.attendanceTarget} onChange={(e) => update({ attendanceTarget: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timer Focus (min)</Label>
              <Input type="number" min={1} value={settings.timerFocusDuration} onChange={(e) => update({ timerFocusDuration: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Timer Break (min)</Label>
              <Input type="number" min={1} value={settings.timerBreakDuration} onChange={(e) => update({ timerBreakDuration: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time Format</Label>
            <div className="flex gap-2">
              {(["12h", "24h"] as const).map((f) => (
                <button key={f} onClick={() => update({ timeFormat: f })}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${settings.timeFormat === f ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-border text-muted-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Data</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <HardDrive className="size-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium">Local Storage</p>
              <p className="text-[11px] text-muted-foreground">{formatBytes(storage.used)} of {formatBytes(storage.quota)} used</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="size-4" /> Export Backup
            </Button>
            <Button variant="outline" onClick={handleImport} className="gap-2">
              <Upload className="size-4" /> Import Backup
            </Button>
            <Button variant="destructive" onClick={handleClearData} className="gap-2">
              <Trash2 className="size-4" /> Clear All Data
            </Button>
          </div>

          <div className="border-t border-border/40 pt-4">
            <h3 className="text-xs font-semibold mb-2">Demo Mode</h3>
            <p className="text-xs text-muted-foreground mb-3">Load sample data to explore features. Clear demo data to start fresh.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLoadDemo} className="gap-2">
                <Sparkles className="size-4" /> Load Demo Data
              </Button>
              <Button variant="outline" onClick={async () => { await clearDemoData(); toast.success("Demo data cleared"); window.location.reload(); }} className="gap-2">
                <Trash2 className="size-4" /> Clear Demo Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">About</h2>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Student OS v1.0</p>
          <p>An offline-first workspace for managing classes, assignments, notes, attendance, exams, study plans, goals, and academic progress.</p>
          <p>All data is stored locally in your browser. No account required.</p>
        </div>
      </div>
    </div>
  );
}
