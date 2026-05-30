import { useEffect, useState } from "react";

function supportsMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (!supportsMatchMedia()) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!supportsMatchMedia()) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
