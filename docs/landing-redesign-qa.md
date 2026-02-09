# BOF Landing Redesign QA Report

Date: 2026-02-09
Target: https://bullshitorfit.com/

## Scope Covered
- Keyboard navigation and visible focus across CTA + form controls.
- Reduced-motion behavior check.
- Responsive layout checks at 390, 768, 1024, and 1440 widths.
- Lighthouse-style perf/accessibility/SEO sanity pass.
- Legal disclaimer visibility check.

## Evidence
- Screenshots:
  - `artifacts/screenshots/bof-landing-390x844.png`
  - `artifacts/screenshots/bof-landing-768x1024.png`
  - `artifacts/screenshots/bof-landing-1024x900.png`
  - `artifacts/screenshots/bof-landing-1440x1024.png`
- Lighthouse report: `/tmp/bof-lighthouse-desktop.json`
- Keyboard tab sweep (headless Playwright) confirmed focus progression through hero CTAs, lead form fields, submit actions, and footer links.

## Results
- Keyboard/focus:
  - PASS: Tab order reaches both hero CTAs, all lead form inputs, both submit buttons, and footer links.
  - PASS: Primary interactive controls use visible `2px` focus outlines.
- Reduced motion:
  - PASS: `prefers-reduced-motion: reduce` disables animation/transition (`animationName: none`, duration `0s`).
- Responsive behavior:
  - PASS: No horizontal overflow at 390/768/1024/1440.
  - PASS: CTA/form layout adapts correctly (single-column on small viewports, split layout on desktop).
- Lighthouse-style fundamentals (desktop, provided throttling):
  - Performance: `0.97`
  - Accessibility: `1.00`
  - Best Practices: `1.00`
  - SEO: `1.00`
  - FCP: `0.9s`
  - LCP: `1.0s`
  - CLS: `0.059`
  - TBT: `0ms`
  - Transfer size: `217 KiB`
- Legal/compliance copy:
  - PASS: Screening-assistance disclaimer is present in body trust section and footer.

## Issues Found
- No P1 usability bugs found in the lead form journey on desktop or mobile viewport checks.

## Residual Risks / Follow-ups
- Lighthouse reports estimated `55 KiB` unused JavaScript; acceptable for launch, but can be reduced later with chunk-level optimization.
- Live CTA text can change via `/api/landing-config`; copy QA should be repeated if config text is updated.
