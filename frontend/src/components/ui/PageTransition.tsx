import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
