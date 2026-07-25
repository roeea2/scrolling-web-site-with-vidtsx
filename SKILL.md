---
name: scrolling-web-site-with-vidtsx
description: >-
  Interview-first studio for building premium animated websites in TSX (React +
  TypeScript + Vite). Runs a structured step-by-step interview so the user
  discovers what they actually want, pitches 2-3 named concepts, art-directs the
  world, then builds a production site with 2D motion, 3D scenes (react-three-
  fiber), or a scroll-film - and never ships without the responsive sweep and
  the verification harness. TSX animation examples live at https://vidtsx.com.
  Trigger on "build me a site in tsx", "animated react site", "vidtsx site",
  "interview me for a site", "3D landing page", "motion site", or any request
  for a premium animated website in React/TSX. NOT for plain static brochure
  pages or slide decks.
---

# Scrolling Web Site with VidTSX

You build **premium animated TSX websites**. This skill is a process, not a
scaffold: every site is designed and written from scratch for its brand. All
taste decisions (concepts, palette, type, motion, copy, code) are made by you,
the Claude model. Mechanical work (screenshots, jank tests, deploys) goes to
scripts with no model.

**Example library:** https://vidtsx.com hosts TSX animation examples (2D motion
graphics and 3D scenes, Remotion-based). Browse it for patterns and motion
vocabulary when the user wants "something like that" - adapt the ideas to the
brand; never copy a component verbatim into a site without rethinking it. A
curated, offerable catalog of these examples (logo reveals, countdowns, kinetic
type, data charts, product reveals, retro/gaming, 3D nature/POV scenes, and
more) with seed prompts lives in `references/example-gallery.md` - pull from it
whenever the user is unsure or wants a motion accent.

**Local source library:** 26 real VidTSX compositions live on disk at
`~/documents/hermes_projects/vidtsx-library/`, indexed with pattern notes and
port math in `references/example-library.md`. When the user's brief matches an
entry, offer it by name in the interview and port from the actual source at
build time (conversion rules are in that file's header). The .tsx sources are
local-only: never commit or copy them into any repo or generated site.

---

## STEP 0 - The interview (batched, structured, step by step)

Use the host's structured-question UI (AskUserQuestion) and batch questions.
Every creative question has a "you decide" escape hatch - if the user defers,
art-direct it yourself and keep moving. Never block on a design answer you can
make well. Ask:

1. **What are we building, and the one-line vibe?** Brand name, what it is,
   the feeling. Offer to invent the brand entirely.
2. **Brand assets or full creative freedom?** Logo / colors / fonts / imagery,
   or you create the world.
3. **Motion language - what kind of alive?**
   - *2D motion*: scroll-driven reveals, parallax, springs, particles, kinetic
     type (GSAP/Lenis or hand-rolled rAF).
   - *3D scenes*: react-three-fiber hero or full-page 3D (see the 3D law in
     `references/tsx-motion-law.md`).
   - *Scroll-film*: the page is one continuous cinematic shot scrubbed by
     scroll. If the scroll-film-studio skill is installed, hand the film
     production to its process and keep the TSX build here.
   - If the user is unsure, offer 3-4 concrete starting points from
     `references/example-gallery.md` (a logo reveal, a countdown, a data
     story, a 3D hero) instead of an open-ended question. Better: when the
     brief matches a local source entry in `references/example-library.md`,
     offer THAT by name ("we have the source for X - want it as your sticky
     scene?").
4. **The journey.** What does the visitor see top to bottom - the narrative arc.
   This is the heart of the build.
5. **Content sections and the primary CTA.** What comes after the hero
   (products / booking / manifesto / contact), plus socials.
6. **Where does it go live?** Local only, or their Vercel.

Then **pitch 2-3 named concepts** with concrete what-you-see walkthroughs
(narrate the scroll, not a thesis one-liner). Mark one "(Recommended)". Build
only after a concept is chosen; if the user says "you choose", take the
recommended one and go.

## STEP 1 - Art-direct the world

Commit before coding: exact palette hexes, a display+body type pairing with
real character (never default system fonts), an inline-SVG logo lockup, motion
feel, section rhythm. One distinct world per brand - never ship two brands that
look like the same site.

## STEP 2 - Build (TSX law)

Stack: **Vite + React + TypeScript**, plain CSS custom properties (or the
project's existing system). Key laws, in full in
`references/tsx-motion-law.md`:

- Never `setState` per animation tick. Scroll/rAF engines write to DOM via
  refs; React renders structure, not frames.
- Seeded randomness only (`Math.sin(seed * 9999)` style) for any generated
  particles/data - deterministic on every render. Never `Math.random()` in
  render paths.
- Spring accents: `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot for entrances;
  IntersectionObserver + a `.reveal` class for section entries.
- 3D (react-three-fiber): time-based animation (`clock.getElapsedTime()`),
  `useMemo` for all procedural geometry, InstancedMesh beyond ~50 identical
  objects, ~500 mesh budget, 3-point lighting, no post-processing passes -
  fake bloom with emissive materials and fog.
- Respect `prefers-reduced-motion` in every build.
- Copy style: confident, concrete, zero fluff. Never use long dashes (em or
  en) anywhere - hyphens or rephrase.
- Porting from the local VidTSX library: read the source .tsx first, extract
  the motion math, apply the frame-to-live conversion rules in
  `references/example-library.md`, and rethink it for the brand. Never paste a
  library component into a site verbatim.

## STEP 3 - The responsive law (never skip)

A build is not done until this sweep passes, measured, not eyeballed:

1. **Five viewports minimum**: 390x844, 768x1024, 1024x768, 1440x900,
   1920x1080.
2. **Zero horizontal overflow** at every viewport, checked programmatically
   (`scrollWidth - innerWidth <= 0`) at multiple scroll depths (0%, 30%, 75%,
   95%), not just at the top.
3. **Fixed chrome collision check** on the smallest viewport - logos,
   nav, and readouts must not overlap; hide or collapse elements below
   600px rather than letting them collide.
4. Fluid type via `clamp()`; grids collapse to one column below ~900px; wide
   content scrolls inside its own container, never the page body.
5. Screenshot every major section at phone + desktop and actually look at them.

## STEP 4 - Verify and ship

- **Dev contract** in every build: `?jump=<scrollY>` lands pre-scrolled and
  settled; `window.__ready = true` fires only when truly ready. Screenshot via
  puppeteer-core + system Chrome (host preview panes throttle hidden tabs).
- **Jank test**: rAF deltas, judge p95/max (target max < 50ms), never average
  fps. A classic spike source: reading pixels back from a GPU-backed canvas
  every frame - sample from the decoded source image instead.
- **OG card**: screenshot the real hero at 1200x630, < 300 KB, full
  `og:` + `twitter:` tag set with **absolute** production URLs, then curl the
  live og.jpg and grep the served HTML to prove it.
- **Security gate before any deploy**: run the exposure audit (secrets, PII,
  personal emails, EXIF, local paths) and only publish on PASS.
- Deploy a lean build dir to the user's Vercel; report the production URL and
  the audit verdict table.
