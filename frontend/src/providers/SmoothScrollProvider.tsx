import React, { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: true });

    return () => {
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
