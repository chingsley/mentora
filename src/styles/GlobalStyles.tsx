"use client";

import { createGlobalStyle } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
    padding: 0;
  }

  :root {
    color-scheme: light;
  }

  html,
  body {
    height: 100%;
  }

  body {
    min-height: 100dvh;
    background-color: ${COLORS.BACKGROUND};
    color: ${COLORS.TEXT};
    font-family: ${FONTS.FAMILY.PRIMARY};
    font-size: ${FONTS.SIZE.BASE};
    font-weight: ${FONTS.WEIGHT.NORMAL};
    line-height: ${FONTS.LINE_HEIGHT.NORMAL};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
  }

  input,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }

  img,
  svg,
  video,
  canvas {
    display: block;
    max-width: 100%;
  }

  ul,
  ol {
    list-style: none;
  }

  /* Pointer cursor on enabled clickable controls */
  :where(button:not(:disabled),
    input[type="button"]:not(:disabled),
    input[type="submit"]:not(:disabled),
    input[type="reset"]:not(:disabled)) {
    cursor: pointer;
  }

  :where(button:disabled,
    input[type="button"]:disabled,
    input[type="submit"]:disabled,
    input[type="reset"]:disabled) {
    cursor: not-allowed;
  }

  /* Accessible focus ring */
  :where(button, a, input, select, textarea):focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: 2px;
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
