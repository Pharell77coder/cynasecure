import React from "react";
import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({ eyebrow, title, lead, align = "left", className }: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow && (
        <p className="mb-3 font-mono text-[0.7rem] font-medium tracking-[0.15em] uppercase text-blue-500">
          {eyebrow}
        </p>
      )}
      <h2
        className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl"
        style={{ letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-4 text-sm leading-relaxed text-gray-400", centered ? "mx-auto max-w-xl" : "max-w-xl")}>
          {lead}
        </p>
      )}
    </div>
  );
}
