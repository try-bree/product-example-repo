import { Platform } from "react-native"
import type { TextStyle } from "react-native"

/**
 * Custom fonts to load (empty for system fonts)
 */
export const customFontsToLoad = {}

/**
 * Font family definitions with fallbacks
 */
export const fonts = {
  primary: Platform.select({
    ios: "SF Pro Display",
    android: "Roboto",
    default: "System",
  }),
  secondary: Platform.select({
    ios: "SF Pro Text",
    android: "Roboto",
    default: "System",
  }),
  mono: Platform.select({
    ios: "SF Mono",
    android: "Roboto Mono",
    default: "monospace",
  }),
} as const

/**
 * Font weight system
 */
export const fontWeights = {
  light: "300" as TextStyle["fontWeight"],
  regular: "400" as TextStyle["fontWeight"],
  medium: "500" as TextStyle["fontWeight"],
  semibold: "600" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
  heavy: "800" as TextStyle["fontWeight"],
} as const

/**
 * Font size scale following type scale principles
 */
export const fontSizes = {
  xs: 12, // Caption, footnotes
  sm: 14, // Body small, labels
  md: 16, // Body text (base)
  lg: 18, // Body large, subheadings
  xl: 20, // Small headings
  xxl: 24, // Medium headings
  xxxl: 28, // Large headings
  display1: 32, // Display small
  display2: 36, // Display medium
  display3: 40, // Display large
  display4: 48, // Display extra large
  giant: 56, // Hero text
} as const

/**
 * Line height scale for optimal readability
 */
export const lineHeights = {
  tight: 1.2, // Headings and display text
  normal: 1.4, // Body text
  relaxed: 1.6, // Large body text
  loose: 1.8, // Captions and fine print
} as const

/**
 * Letter spacing for improved readability
 */
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const

/**
 * Typography style presets for common text patterns
 */
export const typography = {
  // Legacy structure for backward compatibility with Text component
  primary: {
    // These should match your font weights
    light: fonts.primary,
    normal: fonts.primary,
    medium: fonts.primary,
    semiBold: fonts.primary,
    bold: fonts.primary,
  },

  // Modern typography styles
  // Display styles for hero sections
  displayLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.display4,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display4 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  displayMedium: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.display2,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display2 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  displaySmall: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.display1,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.display1 * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Heading styles
  headingLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xxxl * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  headingMedium: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xxl * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  headingSmall: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Body text styles
  bodyLarge: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Label and UI text
  labelLarge: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  labelMedium: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  labelSmall: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Caption and helper text
  caption: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.loose,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Button text
  buttonLarge: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  buttonMedium: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Financial/numeric text
  currency: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  currencyLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.display1,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display1 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  // Code and monospace
  code: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
} as const
