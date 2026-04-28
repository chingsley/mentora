import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Single app-wide UI font. Apply `appSans.variable` on `<html>` (see root `layout.tsx`).
 *
 * `variable` must be a string literal here — Next.js font loaders do not accept
 * imported constants. Keep it in sync with `FONT_FACE.APP_UI_VARIABLE` in
 * `src/constants/fonts.constants.ts`.
 */
export const appSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
  adjustFontFallback: true,
});
