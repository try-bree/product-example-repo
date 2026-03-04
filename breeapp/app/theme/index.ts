// Core theme exports
export { colors } from "./colors"
export { spacing, shadows, radius, layout } from "./spacing"
export { typography, fonts, fontSizes, fontWeights } from "./typography"

// Design tokens for easy access
export const designTokens = {
  // Animation durations (ms)
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Opacity values
  opacity: {
    disabled: 0.6,
    pressed: 0.8,
    overlay: 0.4,
    backdrop: 0.25,
  },

  // Z-index values
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },

  // Border widths
  borderWidth: {
    none: 0,
    thin: 1,
    thick: 2,
    heavy: 3,
  },

  // Common sizes
  sizes: {
    icon: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    avatar: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      xxl: 80,
    },
    button: {
      sm: 32,
      md: 44,
      lg: 52,
      xl: 60,
    },
    input: {
      sm: 36,
      md: 44,
      lg: 52,
    },
  },
} as const
