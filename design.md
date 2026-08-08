---
version: 1.0.0
name: TheJonitaj Gym System
description: High-impact dark mode system with cinematic scroll-driven effects and bold typography.
colors:
  background: "#0a0a0a"
  surface: "#171717"
  primary: "#ef4444"
  primary-dark: "#dc2626"
  text-heading: "#ffffff"
  text-body: "#d4d4d4"
  text-muted: "#737373"
  text-dim: "#525252"
  border: "rgba(255, 255, 255, 0.1)"
  glass: "rgba(10, 10, 10, 0.4)"
typography:
  fontFamily: "'Geist', sans-serif"
  display:
    fontSize: "6rem"
    fontWeight: "500"
    lineHeight: "0.9"
    letterSpacing: "-0.05em"
  h2:
    fontSize: "3rem"
    fontWeight: "500"
    lineHeight: "1.2"
    letterSpacing: "-0.025em"
  body:
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.625"
  label:
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.1em"
    textTransform: "uppercase"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
  section: "128px"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
components:
  buttons:
    primary: "bg-white text-neutral-950 rounded-full font-medium transition-all hover:scale-95"
    secondary: "bg-neutral-900/50 border-neutral-800 backdrop-blur-md rounded-full text-neutral-200"
  cards:
    standard: "bg-neutral-900/30 border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
    feature: "p-8 hover:bg-neutral-800/40 transition-colors"
  navigation:
    header: "fixed top-0 z-50 backdrop-blur-xl bg-neutral-950/40 border-b border-white/5"
  badges:
    pill: "bg-neutral-900 border-neutral-800 px-3 py-1 rounded-full text-neutral-400"
motion:
  reveal: "transition-all duration-1000 ease-out"
  scrollBlur: "scroll-driven blur from 0px to 24px over 800px range"
---

## Overview
A cinematic, high-performance visual system designed for fitness professionals. It focuses on the contrast between `neutral-950` backgrounds and `red-500` accents to create a sense of urgency and power.

## Colors
The palette is dominated by dark neutrals to emphasize photography and red highlights. Use `red-500` for primary brand accents and `red-600` for secondary decorative elements like logo subtexts.

## Typography
Relies on the 'Geist' typeface for a modern, technical feel. Hero headings use massive sizes (up to 8rem) with tight line height (0.9) to create a "wall of text" impact.

## Spacing
Follows an 8px grid system. Section padding is aggressive (up to 128px) to allow content to breathe against high-contrast backgrounds.

## Layout
- **Fixed Background Layer**: Uses absolute positioning with `z-index: -10` and `object-fit: cover` for cinematic immersion.
- **Hero Stack**: Multi-column grid layouts that transition from 1 column on mobile to 2 columns on desktop, aligning text to the bottom-left.
- **Depth Hierarchy**: Uses z-index 10 for background, 20 for standard content, and 50+ for fixed navigation.

## Elevation & Depth
Depth is achieved through `backdrop-blur-xl` and `inset shadow` borders. Components use a subtle `1px white/5%` top border to simulate a light source from above.

## Shapes
Features high curvature. Buttons and secondary badges are always `rounded-full`. Feature containers use `rounded-2xl` (16px) or `rounded-3xl` (24px) to soften the industrial feel of the dark UI.

## Components
- **Fixed Header**: Uses `backdrop-blur` and `border-b` for separation during scroll.
- **Transformation Card**: Large-scale image containers with `mix-blend-luminosity` that transitions to full color on hover.
- **Floating Stats**: Small absolute-positioned badges that overlay image content to provide metadata (e.g., ORM +35 lbs).
- **Step Protocol**: Stacked cards with explicit step labeling and checkmark iconography.

## Motion
- **Scroll Driven**: Background images must blur and darken as the user scrolls using `animation-timeline: scroll()`.
- **Entrance Reveal**: Content should fade in, translate up 32px, and lose a subtle blur effect upon entering the viewport.

## Do's and Don'ts
- **Do**: Use high-contrast monochrome photography.
- **Do**: Apply red highlights only to keywords or branding elements.
- **Don't**: Use harsh solid borders; prefer subtle semi-transparent white lines.
- **Don't**: Use vibrant background colors other than Neutral-950.

## Accessibility
- Maintain a minimum contrast ratio of 4.5:1 for body text.
- Ensure `iconify-icon` elements have appropriate descriptive labels or are hidden from screen readers if purely decorative.
- Use `backdrop-blur` only in conjunction with a background-color fallback for performance and visibility.
