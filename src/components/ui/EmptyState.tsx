import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { emptyState, emptyChild, emptyIconFloat } from "@/lib/animations";
import { SMOOTH } from "@/constants/motion";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? undefined : emptyState}
      initial={reduced ? undefined : "hidden"}
      animate="visible"
      className={`flex flex-col items-center justify-center py-12 text-center ${className || ""}`}
    >
      <motion.div
        variants={reduced ? undefined : emptyChild}
        className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50"
      >
        <motion.div variants={reduced ? undefined : emptyIconFloat} animate="animate">
          <Icon className="size-7 text-muted-foreground/50" />
        </motion.div>
      </motion.div>
      <motion.h3
        variants={reduced ? undefined : emptyChild}
        className="text-sm font-semibold text-foreground/80"
      >
        {title}
      </motion.h3>
      <motion.p
        variants={reduced ? undefined : emptyChild}
        className="mt-1 max-w-[240px] text-xs text-muted-foreground"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          variants={reduced ? undefined : emptyChild}
          className="mt-4"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
