// data/theme.ts — aligned with page.tsx design system
export const theme = {
  colors: {
    cream:   "#faf9f6",   // background
    ink:     "#1a1814",   // dark / primary text
    sand:    "#f0ede6",   // card image background
    white:   "#ffffff",
    muted:   "#8a8478",   // secondary text
    dimmed:  "#4a4640",   // body text
    stone:   "#c8c4ba",   // borders / dividers
    border:  "#e8e4dc",
    success: "#1a6b45",
  },
  fonts: {
    serif:     "Cormorant Garamond",  // headings / prices
    sansSerif: "DM Sans",             // body / labels
  },
  // Minimal radii — matches the sharp aesthetic of page.tsx
  radius: {
    none: 0,
    sm:   2,
    md:   2,   // cards use 2 not 8
    full: 2,   // chips also square
  },
};
