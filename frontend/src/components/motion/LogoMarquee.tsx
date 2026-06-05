import React from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface LogoMarqueeProps {
  label?: string;
  items: string[];
  className?: string;
}

export function LogoMarquee({ label, items, className }: LogoMarqueeProps) {
  const reduced = useReducedMotion();
  const doubled = [...items, ...items];

  return (
    <div className={`relative overflow-hidden border-y border-white/5 bg-gray-900/50 py-10 ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-gray-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-gray-950 to-transparent" />

      {label && (
        <p className="mb-6 text-center font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gray-500">
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
            className="mx-10 flex shrink-0 items-center text-gray-500 font-mono text-xs tracking-[0.15em] uppercase transition-colors duration-300 hover:text-gray-300"
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
