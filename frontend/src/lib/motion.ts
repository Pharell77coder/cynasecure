export const duration = {
  fast: 0.18,
  base: 0.24,
  slow: 0.4,
} as const;

export const ease = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeOutExpo: [0.19, 1, 0.22, 1] as const,
};

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.easeOut } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.base, ease: ease.easeOut } },
  },
} as const;
