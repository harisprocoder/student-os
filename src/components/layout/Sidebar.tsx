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
  ChevronLeft,
  ChevronRight,
  WifiOff,
} from "lucide-react";

/* ─── Grouped Navigation Config ──────────────────────────────────────────────── */
const navSections = [
  {
    label: "Overview",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/subjects", label: "Subjects", icon: BookOpen },
      { path: "/timetable", label: "Timetable", icon: Calendar },
    ],
  },
  {
    label: "Study",
    items: [
      { path: "/assignments", label: "Assignments", icon: ClipboardList },
      { path: "/study-planner", label: "Study Planner", icon: Calendar },
      { path: "/study-timer", label: "Study Timer", icon: Timer },
    ],
  },
  {
    label: "Progress",
    items: [
      { path: "/attendance", label: "Attendance", icon: Users },
      { path: "/exams", label: "Exams", icon: GraduationCap },
      { path: "/marks", label: "Marks & GPA", icon: BarChart3 },
      { path: "/goals", label: "Goals", icon: Target },
    ],
  },
  {
    label: "Personal",
    items: [
      { path: "/notes", label: "Notes", icon: FileText },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

type NavItem = { path: string; label: string; icon: React.ElementType };

/* ─── Sidebar Nav Item ───────────────────────────────────────────────────────── */
function NavItem({
  item,
  onLinkClick,
  collapsed,
}: {
  item: NavItem;
  onLinkClick?: () => void;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const isActive =
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/");
  const Icon = item.icon;
  const reduced = useReducedMotion();

  return (
    <NavLink
      to={item.path}
      onClick={onLinkClick}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {/* Active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500"
          transition={reduced ? { duration: 0 } : SPRING_SIDEBAR}
        />
      )}

      {/* Hover background */}
      {!reduced && !isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-white/[0.03]"
          initial={false}
          whileHover={{ opacity: 1 }}
          style={{ opacity: 0 }}
        />
      )}

      <Icon
        className={cn(
          "relative z-10 size-4 shrink-0 transition-colors",
          isActive && "text-primary"
        )}
      />
      {!collapsed && (
        <span className="relative z-10 truncate">{item.label}</span>
      )}
    </NavLink>
  );
}

/* ─── Section Label ──────────────────────────────────────────────────────────── */
function SectionLabel({ label, collapsed }: { label: string; collapsed?: boolean }) {
  if (collapsed) return <div className="mx-2 my-2 h-px bg-border/50" />;
  return (
    <p className="px-2.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {label}
    </p>
  );
}

/* ─── Sidebar Content ────────────────────────────────────────────────────────── */
function SidebarContent({
  onLinkClick,
  collapsed,
}: {
  onLinkClick?: () => void;
  collapsed?: boolean;
}) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const reduced = useReducedMotion();

  return (
    <div className="flex h-full flex-col">
      {/* Logo + Collapse */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/40 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
          <Sparkles className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold tracking-tight">Student OS</h1>
            <p className="text-[10px] text-muted-foreground/60">Offline Workspace</p>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-2">
        {navSections.map((section) => (
          <div key={section.label}>
            <SectionLabel label={section.label} collapsed={collapsed} />
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  onLinkClick={onLinkClick}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/40 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
          <WifiOff className="size-3 shrink-0" />
          {!collapsed && <span>All data stored locally</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Sidebar ────────────────────────────────────────────────────────── */
export function DesktopSidebar() {
  const { sidebarOpen } = useUIStore();
  const reduced = useReducedMotion();

  return (
    <>
      {/* Collapsed mini-sidebar */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.aside
            initial={reduced ? { width: 0 } : { width: 0, opacity: 0 }}
            animate={{ width: 56, opacity: 1 }}
            exit={reduced ? { width: 0 } : { width: 0, opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: DUR.normal, ease: "easeInOut" }
            }
            className="hidden h-screen shrink-0 overflow-hidden border-r border-border/40 bg-sidebar lg:flex"
          >
            <div className="flex h-full w-14 flex-col items-center pt-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
                <Sparkles className="size-4" />
              </div>
              <nav className="mt-4 flex flex-col gap-1">
                {navSections.flatMap((s) => s.items).map((item) => (
                  <NavItem key={item.path} item={item} collapsed />
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Full sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={reduced ? { width: 240, opacity: 1 } : { width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={reduced ? { width: 0, opacity: 0 } : { width: 0, opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: DUR.normal, ease: "easeInOut" }
            }
            className="hidden h-screen shrink-0 overflow-hidden border-r border-border/40 bg-sidebar lg:flex"
          >
            <div className="h-full w-60">
              <SidebarContent />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Mobile Sidebar (Drawer) ────────────────────────────────────────────────── */
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <motion.aside
            initial={reduced ? { x: 0 } : { x: "-100%", opacity: 0.5 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={reduced ? { x: "-100%" } : { x: "-100%", opacity: 0 }}
            transition={reduced ? { duration: 0 } : SPRING_DRAWER}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-sidebar shadow-2xl lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-sm font-bold">Student OS</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent
              onLinkClick={() => setMobileSidebarOpen(false)}
            />
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setMobileSidebarOpen(true)}
        className="rounded-lg p-2 transition-colors hover:bg-muted"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </motion.button>
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Sparkles className="size-3.5" />
        </div>
        <span className="text-sm font-semibold">Student OS</span>
      </div>
    </header>
  );
}
