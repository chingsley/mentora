/**
 * Spacing scale. Mirrors common Tailwind step values 1:1 (`1` = 0.25rem = 4px) so the
 * existing visual rhythm is preserved when migrating off utility classes.
 */
export const SPACING = {
  NONE: "0",
  HALF: "0.125rem", // 2px
  ONE: "0.25rem", // 4px
  TWO: "0.5rem", // 8px
  THREE: "0.75rem", // 12px
  FOUR: "1rem", // 16px
  FIVE: "1.25rem", // 20px
  SIX: "1.5rem", // 24px
  EIGHT: "2rem", // 32px
  TEN: "2.5rem", // 40px
  TWELVE: "3rem", // 48px
  SIXTEEN: "4rem", // 64px
  TWENTY: "5rem", // 80px
} as const;
