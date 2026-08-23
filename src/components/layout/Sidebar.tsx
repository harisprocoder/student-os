import { NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SPRING_SIDEBAR, SMOOTH, EXIT_EASE, SPRING_DRAWER, DUR } from "@/constants/motion";
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

/* ─── Sidebar Nav Item ───────────────────────────────────────────────────────── */
function NavItem({ item, onLinkClick }: { item: (typeof navItems)[number]; onLinkClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
  const Icon = item.icon;
  const reduced = useReducedMotion();

  return (
    <NavLink
      to={item.path}
      onClick={onLinkClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {/* Active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-500"
          transition={reduced ? { duration: 0 } : SPRING_SIDEBAR}
        />
      )}

      {/* Hover background */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-indigo-500/[0.04]"
          initial={false}
          whileHover={{ opacity: 1 }}
          style={{ opacity: isActive ? 0 : undefined }}
        />
      )}

      <Icon
        className={cn(
          "relative z-10 size-4 shrink-0 transition-colors",
          isActive && "text-indigo-600 dark:text-indigo-400",
        )}
      />
      <span className="relative z-10 truncate">{item.label}</span>
    </NavLink>
  );
}

/* ─── Sidebar Content ────────────────────────────────────────────────────────── */
function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Student OS</h1>
          <p className="text-[10px] text-muted-foreground">Offline Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} onLinkClick={onLinkClick} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-3">
        <p className="text-center text-[10px] text-muted-foreground">Everything stays on your device</p>
      </div>
    </div>
  );
}

/* ─── Desktop Sidebar ────────────────────────────────────────────────────────── */
export function DesktopSidebar() {
  const { sidebarOpen } = useUIStore();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={reduced ? { width: 240, opacity: 1 } : { width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={reduced ? { width: 0, opacity: 0 } : { width: 0, opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: DUR.normal, ease: "easeInOut" }}
          className="hidden h-screen shrink-0 overflow-hidden border-r border-border/50 bg-card/50 backdrop-blur-sm lg:flex"
        >
          <div className="h-full w-60">
            <SidebarContent />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile Sidebar ─────────────────────────────────────────────────────────── */
export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : DUR.normal }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={reduced ? { x: 0 } : { x: "-100%", opacity: 0.5 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={reduced ? { x: "-100%" } : { x: "-100%", opacity: 0 }}
            transition={reduced ? { duration: 0 } : SPRING_DRAWER}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card shadow-xl lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-sm font-bold">Student OS</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-muted"
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

/* ─── Mobile Header ──────────────────────────────────────────────────────────── */
export function MobileHeader() {
  const { setMobileSidebarOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md lg:hidden">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setMobileSidebarOpen(true)}
        className="rounded-lg p-2 transition-colors hover:bg-muted"
      >
        <Menu className="size-5" />
      </motion.button>
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <Sparkles className="size-3.5" />
        </div>
        <span className="text-sm font-semibold">Student OS</span>
      </div>
    </header>
  );
}
