import { NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  Users,
  GraduationCap,
  BarChart3,
  Timer,
  Target,
  Settings,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/assignments", label: "Assignments", icon: ClipboardList },
  { path: "/timetable", label: "Timetable", icon: Calendar },
  { path: "/attendance", label: "Attendance", icon: Users },
  { path: "/exams", label: "Exams", icon: GraduationCap },
  { path: "/marks", label: "Marks & GPA", icon: BarChart3 },
  { path: "/study-planner", label: "Study Planner", icon: Calendar },
  { path: "/study-timer", label: "Study Timer", icon: Timer },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">DAE Student OS</h1>
          <p className="text-[10px] text-muted-foreground">Offline Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onLinkClick}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-indigo-500/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <Icon className={cn("relative z-10 size-4 shrink-0", isActive && "text-indigo-600 dark:text-indigo-400")} />
                <span className="relative z-10 truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-3">
        <p className="text-[10px] text-muted-foreground text-center">
          Your data stays on your device
        </p>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  const { sidebarOpen } = useUIStore();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="hidden lg:flex h-screen shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="w-60 h-full">
            <SidebarContent />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.35 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-xl lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-sm font-bold">DAE Student OS</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setMobileSidebarOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function MobileHeader() {
  const { setMobileSidebarOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 lg:hidden">
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="rounded-lg p-2 hover:bg-muted transition-colors"
      >
        <Menu className="size-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <Sparkles className="size-3.5" />
        </div>
        <span className="text-sm font-semibold">DAE Student OS</span>
      </div>
    </header>
  );
}
