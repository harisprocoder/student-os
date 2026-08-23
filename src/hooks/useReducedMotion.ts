import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

/**
 * Returns animated props if motion is allowed, otherwise returns static props.
 * Pass an empty object {} as staticProps to disable all animation.
 */
export function useMotionSafe<T extends Record<string, unknown>>(
  animatedProps: T,
  staticProps?: Partial<T>,
): T | Partial<T> {
  const reduced = useReducedMotion();
  if (reduced) return staticProps ?? {};
  return animatedProps;
}
