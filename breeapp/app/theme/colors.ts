const palette = {
  // Primary Brand Colors - Professional Financial Green
  primary50: "#f0fdf4",
  primary100: "#dcfce7",
  primary200: "#bbf7d0",
  primary300: "#86efac",
  primary400: "#4ade80",
  primary500: "#22c55e", // Main brand color
  primary600: "#16a34a",
  primary700: "#15803d",
  primary800: "#166534",
  primary900: "#14532d",

  // Secondary - Sophisticated Blue for Trust
  secondary50: "#eff6ff",
  secondary100: "#dbeafe",
  secondary200: "#bfdbfe",
  secondary300: "#93c5fd",
  secondary400: "#60a5fa",
  secondary500: "#3b82f6",
  secondary600: "#2563eb",
  secondary700: "#1d4ed8",
  secondary800: "#1e40af",
  secondary900: "#1e3a8a",

  // Accent - Premium Gold for Success States
  accent50: "#fffbeb",
  accent100: "#fef3c7",
  accent200: "#fde68a",
  accent300: "#fcd34d",
  accent400: "#fbbf24",
  accent500: "#f59e0b",
  accent600: "#d97706",
  accent700: "#b45309",
  accent800: "#92400e",
  accent900: "#78350f",

  // Neutral Grays - Modern & Clean
  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#171717",

  // Semantic Colors
  success50: "#f0fdf4",
  success500: "#22c55e",
  success600: "#16a34a",
  success700: "#15803d",

  warning50: "#fffbeb",
  warning500: "#f59e0b",
  warning600: "#d97706",
  warning700: "#b45309",

  error50: "#fef2f2",
  error500: "#ef4444",
  error600: "#dc2626",
  error700: "#b91c1c",

  info50: "#eff6ff",
  info500: "#3b82f6",
  info600: "#2563eb",
  info700: "#1d4ed8",

  // Overlays & Surfaces
  overlay: "rgba(0, 0, 0, 0.6)",
  surface: "#ffffff",
  backdrop: "rgba(0, 0, 0, 0.25)",

  // Special Financial UI Colors
  money: "#16a34a", // For currency amounts
  profit: "#22c55e", // For positive changes
  loss: "#ef4444", // For negative changes
  pending: "#f59e0b", // For pending states
}

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",

  // Light theme colors
  text: palette.neutral900,
  textDim: palette.neutral600,
  textInverse: palette.neutral50,
  textLink: palette.secondary600,

  background: palette.neutral50,
  backgroundSurface: palette.surface,
  backgroundAccent: palette.primary50,

  border: palette.neutral200,
  borderFocus: palette.primary500,
  borderError: palette.error500,

  // Legacy properties that existing components expect
  separator: palette.neutral200,
  error: palette.error500,
  errorBackground: palette.error50,

  tint: palette.primary600,
  tintInactive: palette.neutral400,
  tintSuccess: palette.success600,
  tintWarning: palette.warning600,
  tintError: palette.error600,

  // Component specific
  card: palette.surface,
  cardBorder: palette.neutral100,
  cardShadow: "rgba(0, 0, 0, 0.04)",

  button: {
    primary: palette.primary600,
    primaryHover: palette.primary700,
    secondary: palette.neutral100,
    secondaryHover: palette.neutral200,
    danger: palette.error600,
    dangerHover: palette.error700,
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
