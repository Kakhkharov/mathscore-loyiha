---
name: MathScore Design System
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#464555'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#4849da'
  primary: '#4343d5'
  on-primary: '#ffffff'
  primary-container: '#5d5fef'
  on-primary-container: '#faf7ff'
  inverse-primary: '#c1c1ff'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fc9d41'
  on-secondary-container: '#6b3900'
  tertiary: '#006822'
  on-tertiary: '#ffffff'
  tertiary-container: '#00842e'
  on-tertiary-container: '#e5ffe0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c1c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2e2bc2'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#73fe84'
  tertiary-fixed-dim: '#55e16b'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#005319'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system for MathScore is built to bridge the gap between rigorous academic achievement and the vibrant energy of student life. Target audiences include high-school students preparing for high-stakes exams (SAT, A-Levels) who require a platform that feels both authoritative and encouraging.

The visual style is **Corporate Modern with a Playful Edge**. It utilizes clean, professional layouts typical of premium SaaS platforms but injects life through a "Chromatic Container" system inspired by the reference imagery. The emotional goal is to reduce "math anxiety" by using soft, approachable shapes and a diverse color palette that categorizes complex information into manageable, friendly modules. The interface should feel structured and logical (high-trust) but never clinical or boring (energetic).

## Colors

The color strategy uses a deep, trustworthy Indigo/Blue as the primary brand anchor for navigation and primary actions. To maintain the energetic education vibe, a "Category Palette" is used for course modules, difficulty levels, or subject tags.

- **Primary (Indigo):** Used for buttons, active states, and core branding.
- **Secondary (Orange):** Used for highlights, achievement badges, and "on-sale" prompts.
- **Surface Tints:** Each accent color (Green, Purple, Yellow, Blue, Orange) has a "Soft" variant (10-15% opacity) used for large container backgrounds, paired with a high-saturation 2px border of the same hue to mimic the reference style.
- **Neutral:** A deep charcoal is used for text to ensure high legibility, while backgrounds remain primarily off-white (#F9FAFB) to keep the UI feeling airy and clean.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels. This font provides a contemporary, slightly rounded geometric feel that balances professional clarity with an approachable, friendly tone.

- **Headlines:** Use Bold (700) or ExtraBold (800) weights with tighter letter spacing to create a strong visual impact.
- **Body Text:** Use Regular (400) weight for maximum readability in long-form math explanations and problem descriptions.
- **Labels:** Use SemiBold (600) for UI elements like navigation links and button text to ensure they stand out against vibrant backgrounds.
- **Math Content:** For mathematical notation, use a fallback system font or a LaTeX-rendered Serif (like Noto Serif) to ensure technical symbols are standard and legible.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum width container for desktop to maintain optimal line lengths for educational content.

- **Grid:** 12-column system on desktop, 4-column on mobile.
- **Rhythm:** An 8px-based spacing scale (4, 8, 16, 24, 32, 48, 64) ensures consistent vertical rhythm.
- **Padding:** Containers (cards) should use generous internal padding (min 24px) to give students "room to breathe" while solving problems.
- **Breakpoints:**
  - **Mobile:** < 600px (Margins: 16px)
  - **Tablet:** 600px - 1024px (Margins: 32px)
  - **Desktop:** > 1024px (Margins: 64px or centered container)

## Elevation & Depth

This design system moves away from heavy shadows in favor of **Tonal Layers and Low-Contrast Outlines**.

1.  **Cards & Containers:** Instead of floating with shadows, content blocks use a "thick border" technique (2px solid) in a tinted version of the card's accent color.
2.  **Surface Levels:** 
    - **Level 0 (Background):** Neutral #F9FAFB.
    - **Level 1 (Main Card):** White #FFFFFF with a 2px colored border.
    - **Level 2 (Active/Hover):** Add a soft, non-blurred 4px offset shadow (Hard Shadow) in the border's color to simulate a physical "lift" without looking "muddy."
3.  **Interaction:** Buttons use a slight press effect (translateY: 2px) to provide tactile feedback during learning exercises.

## Shapes

The shape language is **Rounded**, reflecting the friendly and supportive nature of the brand.

- **Primary Radius:** 0.5rem (8px) for standard inputs and small buttons.
- **Container Radius:** 1.5rem (24px) for major course cards and instructional blocks (as seen in the reference images).
- **Icons:** Use rounded caps and corners for all iconography to match the "Plus Jakarta Sans" font personality.
- **Feedback Elements:** Success/Error toast notifications should use a pill-shape (3) to differentiate them from static content cards.

## Components

- **Buttons:** Large, high-contrast primary buttons with 0.5rem roundedness. Secondary buttons should use the "ghost" style with a 2px border matching the brand blue.
- **Lesson Cards:** Use the reference style: white background, 24px rounded corners, and a 2px colored border (e.g., Green for Algebra, Purple for Calculus).
- **Progress Bars:** Thick (12px) tracks with rounded ends. Use a gradient of the primary color to show completion.
- **Input Fields:** Large tap targets (min 48px height) with a 2px neutral-200 border that changes to the Primary Blue on focus. Labels should be positioned above the field.
- **Math Chips:** Small, colorful pill-shaped tags used to denote difficulty (e.g., "Hard" in Red, "Easy" in Green) with 10% background opacity and 100% text opacity.
- **Checkboxes/Radios:** Oversized and highly tactile, using the Primary Blue for active states to ensure high visibility.