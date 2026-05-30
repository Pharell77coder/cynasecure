import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "none";
}

export function FadeIn({ children, className, delay = 0, direction = "up" }: FadeInProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 });

  const variants = {
    hidden: {
      opacity: 0,
      y: reduced || direction === "none" ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.45,
        delay: reduced ? 0 : delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}
