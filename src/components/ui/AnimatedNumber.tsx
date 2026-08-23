import { useRef, useEffect } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AnimatedNumber({
  value,
  duration = 0.8,
  formatFn,
  className,
}: {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
    duration: duration * 1000,
  });

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  const display = useTransform(spring, (v) =>
    formatFn ? formatFn(Math.round(v)) : Math.round(v).toString(),
  );

  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {formatFn ? formatFn(value) : value}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
