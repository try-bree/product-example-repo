/**
 * Animation timing constants for consistent motion design
 */

export const timing = {
  // Animation durations (ms)
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,

  // Delays
  delayShort: 100,
  delayMedium: 200,
  delayLong: 500,

  // Easing curves
  easeInOut: "ease-in-out",
  easeIn: "ease-in",
  easeOut: "ease-out",
  linear: "linear",
} as const
