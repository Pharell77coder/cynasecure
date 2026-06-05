import React from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface LogoMarqueeProps {
  label?: string;
  items: string[];
  className?: string;
  variant?: "dark" | "light";
}

export function LogoMarquee({ label, items, className, variant = "light" }: LogoMarqueeProps) {
  const reduced = useReducedMotion();
  const doubled = [...items, ...items];

  const isDark = variant === "dark";

  return (
    <div className={`relative overflow-hidden py-10 ${isDark ? "bg-gray-900/50 border-y border-white/5" : "section-white border-y border-light-border"} ${className ?? ""}`}>
      <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-24 ${isDark ? "bg-gradient-to-r from-gray-950 to-transparent" : "bg-gradient-to-r from-white to-transparent"}`} />
      <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-24 ${isDark ? "bg-gradient-to-l from-gray-950 to-transparent" : "bg-gradient-to-l from-white to-transparent"}`} />

      {label && (
        <p className={`mb-6 text-center font-mono text-[0.65rem] tracking-[0.2em] uppercase ${isDark ? "text-gray-500" : "text-slate-400"}`}>
          {label}
        </p>
      )}

      <div
        className="logo-track flex will-change-transform"
        style={{ animation: reduced ? "none" : "marquee 36s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className={`mx-10 flex shrink-0 items-center font-mono text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-700"}`}
          >
            {item}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .logo-track:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
