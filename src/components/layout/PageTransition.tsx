import { motion } from "framer-motion";
import { SMOOTH, EXIT_EASE, DUR } from "@/constants/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.page, ease: SMOOTH },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: DUR.fast, ease: EXIT_EASE },
  },
};

const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.05 } },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const v = reduced ? pageVariantsReduced : pageVariants;
  return (
    <motion.div
      key="page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={v}
    >
      {children}
    </motion.div>
  );
}
