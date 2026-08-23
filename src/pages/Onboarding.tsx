import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { updateSettings, getSettings } from "@/db/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Target, Check } from "lucide-react";

const SUBJECT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const steps = [
  { title: "Welcome", subtitle: "Let's set up your workspace" },
  { title: "About You", subtitle: "Tell us about yourself" },
  { title: "Subjects", subtitle: "Add your subjects" },
  { title: "Preferences", subtitle: "Set your attendance target" },
  { title: "All Set!", subtitle: "You're ready to go" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState<{ name: string; code: string; color: string }[]>([]);
  const [newSubject, setNewSubject] = useState({ name: "", code: "" });
  const [attendanceTarget, setAttendanceTarget] = useState(75);

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    setSubjects([...subjects, { ...newSubject, color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length] }]);
    setNewSubject({ name: "", code: "" });
  };

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const finish = async () => {
    await updateSettings({
      userName: name || "Student",
      program,
      semester,
      attendanceTarget,
      onboardingCompleted: true,
    });
    // Add subjects to DB
    if (subjects.length > 0) {
      const { db } = await import("@/db/database");
      for (const s of subjects) {
        await db.subjects.add({
          id: crypto.randomUUID(),
          name: s.name,
          code: s.code,
          teacher: "",
          room: "",
          color: s.color,
          icon: "book-open",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    navigate("/dashboard");
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 py-6 px-4">
        {steps.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? "bg-indigo-500 text-white" : i === step ? "bg-indigo-500/10 text-indigo-600 ring-2 ring-indigo-500" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 rounded-full transition-all ${i < step ? "bg-indigo-500" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="size-8" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Student OS</h1>
                    <p className="text-muted-foreground mt-1">Your entire academic life in one workspace</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No cloud, no account, no data leaving your browser.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">About You</h2>
                    <p className="text-sm text-muted-foreground mt-1">A few details to personalize your workspace</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Your Name *</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Haris" autoFocus />
                    </div>
                    <div className="space-y-2">
                      <Label>Program</Label>
                      <Input value={program} onChange={(e) => setProgram(e.target.value)} placeholder="e.g. BS Computer Science" />
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. 5th Semester" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Subjects</h2>
                    <p className="text-sm text-muted-foreground mt-1">Add the courses you're taking this term</p>
                  </div>
                  <div className="flex gap-2">
                    <Input value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="Subject name" onKeyDown={(e) => { if (e.key === "Enter") addSubject(); }} />
                    <Input value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} placeholder="Code" className="w-24" onKeyDown={(e) => { if (e.key === "Enter") addSubject(); }} />
                    <Button onClick={addSubject} size="icon" className="shrink-0"><ArrowRight className="size-4" /></Button>
                  </div>
                  {subjects.length > 0 && (
                    <div className="space-y-1">
                      {subjects.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                          <div className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-sm flex-1">{s.name} <span className="text-muted-foreground text-xs">{s.code}</span></span>
                          <button onClick={() => removeSubject(i)} className="text-xs text-muted-foreground hover:text-rose-600">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">You can skip this and add them later from the sidebar</p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Preferences</h2>
                    <p className="text-sm text-muted-foreground mt-1">Choose your minimum attendance target</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Attendance Target: {attendanceTarget}%</Label>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={attendanceTarget}
                      onChange={(e) => setAttendanceTarget(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50%</span><span>75%</span><span>100%</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="size-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                      <Check className="size-8" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">All Set, {name || "Student"}! 🎉</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your workspace is configured and ready to use</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="size-4" /> {step === 0 ? "Back" : "Previous"}
        </Button>
        <Button
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : finish()}
          disabled={!canProceed()}
          className="gap-2"
        >
          {step === steps.length - 1 ? "Get Started" : "Next"} {step < steps.length - 1 && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
