const palette = {
  // Primary Brand Colors - Professional Financial Green (adjusted for dark mode)
  primary50: "#0c2e0c",
  primary100: "#14532d",
  primary200: "#166534",
  primary300: "#15803d",
  primary400: "#16a34a",
  primary500: "#22c55e", // Main brand color
  primary600: "#4ade80",
  primary700: "#86efac",
  primary800: "#bbf7d0",
  primary900: "#dcfce7",

  // Secondary - Sophisticated Blue for Trust (adjusted for dark mode)
  secondary50: "#1e3a8a",
  secondary100: "#1e40af",
  secondary200: "#1d4ed8",
  secondary300: "#2563eb",
  secondary400: "#3b82f6",
  secondary500: "#60a5fa",
  secondary600: "#93c5fd",
  secondary700: "#bfdbfe",
  secondary800: "#dbeafe",
  secondary900: "#eff6ff",

  // Accent - Premium Gold for Success States (adjusted for dark mode)
  accent50: "#78350f",
  accent100: "#92400e",
  accent200: "#b45309",
  accent300: "#d97706",
  accent400: "#f59e0b",
  accent500: "#fbbf24",
  accent600: "#fcd34d",
  accent700: "#fde68a",
  accent800: "#fef3c7",
  accent900: "#fffbeb",

  // Neutral Grays - Dark Mode
  neutral50: "#171717",
  neutral100: "#262626",
  neutral200: "#404040",
  neutral300: "#525252",
  neutral400: "#737373",
  neutral500: "#a3a3a3",
  neutral600: "#d4d4d4",
  neutral700: "#e5e5e5",
  neutral800: "#f5f5f5",
  neutral900: "#fafafa",

  // Semantic Colors (adjusted for dark mode)
  success50: "#0c2e0c",
  success500: "#22c55e",
  success600: "#4ade80",
  success700: "#86efac",

  warning50: "#78350f",
  warning500: "#fbbf24",
  warning600: "#fcd34d",
  warning700: "#fde68a",

  error50: "#7f1d1d",
  error500: "#ef4444",
  error600: "#f87171",
  error700: "#fca5a5",

  info50: "#1e3a8a",
  info500: "#60a5fa",
  info600: "#93c5fd",
  info700: "#bfdbfe",

  // Overlays & Surfaces (dark mode)
  overlay: "rgba(0, 0, 0, 0.8)",
  surface: "#262626",
  backdrop: "rgba(0, 0, 0, 0.4)",

  // Special Financial UI Colors (dark mode)
  money: "#4ade80",
  profit: "#22c55e",
  loss: "#ef4444",
  pending: "#fbbf24",
}

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",

  // Dark theme colors
  text: palette.neutral900,
  textDim: palette.neutral700,
  textInverse: palette.neutral100,
  textLink: palette.secondary600,

  background: palette.neutral50,
  backgroundSurface: palette.surface,
  backgroundAccent: palette.primary50,

  border: palette.neutral300,
  borderFocus: palette.primary500,
  borderError: palette.error500,

  // Legacy properties that existing components expect
  separator: palette.neutral300,
  error: palette.error500,
  errorBackground: palette.error50,

  tint: palette.primary500,
  tintInactive: palette.neutral400,
  tintSuccess: palette.success500,
  tintWarning: palette.warning500,
  tintError: palette.error500,

  // Component specific
  card: palette.surface,
  cardBorder: palette.neutral200,
  cardShadow: "rgba(0, 0, 0, 0.2)",

  button: {
    primary: palette.primary500,
    primaryHover: palette.primary600,
    secondary: palette.neutral200,
    secondaryHover: palette.neutral300,
    danger: palette.error500,
    dangerHover: palette.error600,
  },

  input: {
    background: palette.surface,
    border: palette.neutral300,
    borderFocus: palette.primary500,
    borderError: palette.error500,
    placeholder: palette.neutral400,
  },

  status: {
    success: palette.success500,
    warning: palette.warning500,
    error: palette.error500,
    info: palette.info500,
    pending: palette.warning500,
  },
}
