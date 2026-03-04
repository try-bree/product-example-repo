/**
 * Professional spacing system following 8px grid methodology
 * This ensures consistent spacing across all components and layouts
 */

export const spacing = {
  /** 2px - Micro spacing for fine-tuned adjustments */
  micro: 2,
  /** 4px - Extra small spacing */
  xs: 4,
  /** 8px - Small spacing */
  sm: 8,
  /** 12px - Small-medium spacing */
  smd: 12,
  /** 16px - Medium spacing - Base unit */
  md: 16,
  /** 20px - Medium-large spacing */
  mlg: 20,
  /** 24px - Large spacing */
  lg: 24,
  /** 32px - Extra large spacing */
  xl: 32,
  /** 40px - Extra extra large spacing */
  xxl: 40,
  /** 48px - Huge spacing */
  huge: 48,
  /** 64px - Massive spacing */
  massive: 64,
  /** 80px - Giant spacing */
  giant: 80,

  // Legacy spacing values for backward compatibility
  xxxs: 2,
  xxs: 4,
  xxxl: 64,
} as const

/**
 * Semantic spacing values for specific use cases
 */
export const layout = {
  // Screen padding and margins
  screenPadding: spacing.md,
  screenPaddingLarge: spacing.lg,
  sectionGap: spacing.xl,
  componentGap: spacing.md,

  // Card and container spacing
  cardPadding: spacing.lg,
  cardPaddingSmall: spacing.md,
  cardGap: spacing.md,

  // Input and form spacing
  inputPadding: spacing.md,
  inputGap: spacing.sm,
  formGap: spacing.lg,

  // Button spacing
  buttonPadding: spacing.md,
  buttonGap: spacing.sm,

  // Navigation and header
  headerHeight: 56,
  tabBarHeight: 80,
  navigationPadding: spacing.md,

  // Lists and items
  listItemPadding: spacing.md,
  listItemGap: spacing.sm,
  listGap: spacing.lg,

  // Modal and overlay
  modalPadding: spacing.lg,
  overlayPadding: spacing.xl,
} as const

/**
 * Border radius system for consistent rounded corners
 */
export const radius = {
  /** 4px - Small radius for small components */
  sm: 4,
  /** 8px - Base radius for most components */
  md: 8,
  /** 12px - Large radius for cards and containers */
  lg: 12,
  /** 16px - Extra large radius for prominent elements */
  xl: 16,
  /** 24px - Huge radius for hero elements */
  xxl: 24,
  /** 9999px - Full rounded for pills and circles */
  full: 9999,
} as const

/**
 * Shadow system for elevation and depth
 */
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  xxl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
} as const
