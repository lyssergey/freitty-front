"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

interface CountUpProps {
  value: number;
  /** Must be a stable function (module-level), e.g. `formatMoneyWhole`. */
  format?: (value: number) => string;
  durationSec?: number;
  className?: string;
}

const plain = (value: number) => String(Math.round(value));

/**
 * Animates a number from its previous value (0 on mount) to `value`. The text node is updated
 * by motion without re-rendering React; screen readers get the final value only.
 */
export function CountUp({ value, format = plain, durationSec = 0.8, className }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (latest) => format(Math.round(latest)));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: durationSec, ease: "easeOut" });
    return () => controls.stop();
  }, [value, durationSec, reduceMotion, motionValue]);

  return (
    <span className={className}>
      <motion.span aria-hidden className="tabular-nums">
        {text}
      </motion.span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
