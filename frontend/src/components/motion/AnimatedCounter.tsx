import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function parseValue(value: string): { prefix: string; num: number | null; suffix: string } {
  const m = value.match(/^([+<>]?)(\d+)([^0-9]*)$/);
  if (!m) return { prefix: "", num: null, suffix: value };
  return { prefix: m[1], num: parseInt(m[2]), suffix: m[3] };
}

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1800, className }: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "-60px" });
  const parsed = useRef(parseValue(value));

  const [display, setDisplay] = useState<string>(() => {
    const p = parseValue(value);
    return p.num !== null ? `${p.prefix}0${p.suffix}` : value;
  });

  useEffect(() => {
    if (!inView) return;
    const { prefix, num, suffix } = parsed.current;
    if (num === null || reduced) { setDisplay(value); return; }

    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(easeOutExpo(progress) * num!);
      setDisplay(`${prefix}${current}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
