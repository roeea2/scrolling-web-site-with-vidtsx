---
name: scrolling-web-site-with-vidtsx
description: >-
  Interview-first studio for premium animated websites and landing pages in
  TSX (React + TypeScript + Vite), plus code-rendered brand videos.
  Interviews, pitches 2-3 named concepts, writes a precise build spec, builds
  2D motion, 3D (react-three-fiber), cinematic video heroes or a
  scroll-film, then scores its own screenshots and fixes until they clear the
  bar. Bakes in SEO, GEO (being cited by AI answers), Core Web Vitals and
  agent readiness, proven by scripts/verify.mjs. Motion sources: VidTSX
  compositions, Magic UI, tactile Kitchen components and cinematic
  techniques, all as vanilla recipes, plus looks in code (thermal, halftone,
  collage). Turns the art direction into directed brand films rendered to
  MP4. Hebrew/RTL, LocalBusiness JSON-LD. Trigger on "build me a site in
  tsx", "landing page", "animated react site", "3D landing page", "Hebrew
  site", "magic ui", "kitchen components", "SEO/GEO for my site", "thermal
  look", "brand video in code", "html to mp4", or any premium animated
  website. NOT for slide decks.
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

**Local source library (optional):** this skill can port motion from real
VidTSX compositions. The sources are EXAMPLE REFERENCE ONLY: never commit
them into any repo, never copy them verbatim into a site. On first run, if
the user has VidTSX .tsx files, agree on one stable folder outside any repo
(suggest `~/vidtsx-library/`) and remember it for future sessions.
`references/example-library.md` catalogs 26 known compositions by filename
with pattern notes and port math; it works with any copy of those files at
the agreed path. `references/motion-patterns.md` distills the reusable
techniques (scroll-film, stroke-draw, particle converge, jump physics,
convergence grid, quickTo parallax, count-ups, packet flow) for builds that
do not have the sources.

**Magic UI (modern component motion):** [magicui.design](https://magicui.design)
(MIT) is a library of 75+ animated React components - border beams, animated
beams, flickering grids, shiny and morphing text, marquees, globes, device
mockups. `references/magicui.md` catalogs every component by job with brand
pairings, says when to install vs port (SEO pages port to vanilla CSS/TS), and
carries proven vanilla ports plus the LCP/CLS laws learned shipping them. Reach
for it whenever a build should feel much more modern: pick 4-8 effects that
tell the brand's story, never a pile of unrelated ones.

**The Kitchen (tactile components):** [dqnamo.com/kitchen](https://www.dqnamo.com/kitchen)
is a set of crafted interaction studies: a pushable button, a perforated
ticket, a postage stamp, a receipt that prints, holographic foil, a card fan, a
hold-to-confirm, a self-drawing signature. Where Magic UI adds light, the
Kitchen adds material (paper, hardware, ink). `references/kitchen.md` catalogs
all 15 by job and brand mood. It carries this skill's own tested vanilla
recipes for 14 of them, and the license rule: the source repo has no LICENSE,
so default to the recipes. `references/kitchen-demo.html` runs every recipe
live, so open it to show a client. Pick 2-4 from one material world.

**Cinematic techniques and landing craft:** adapted from the MIT parts of
[MotionSites Web Builder](https://github.com/Motionsites-AI/claude-skill).
- `references/cinematic-techniques.md`: 11 signature recipes this skill lacked,
  rewritten to its laws:
  - a poster-first video hero, seamless loops, text over media;
  - a pointer-scrubbed turntable, liquid glass, an LCP-safe focus-in headline;
  - a spotlight lens, a ghost word behind a cut-out, a depth carousel;
  - a layered scroll story, a GLB product hero.
- `references/landing-craft.md`: the precise build spec, taste rules with real
  numbers, the anatomy of a landing page that converts, and the look-and-fix
  loop that scores the screenshots.

Their example prompts and media are not MIT and are not used. Neither is their
paid tier: everything here is free and self-hosted.

**Search, AI answers and performance:** `references/seo-geo.md`, distilled from
[claude-seo](https://github.com/AgriciDaniel/claude-seo) (MIT), is what to bake
in while building:
- the prerendered HTML that AI crawlers read;
- answer-first passages;
- the AI crawler table and an honest llms.txt verdict;
- the LCP subparts, fonts with no shift, agent readiness;
- which schema still earns a rich result.

`scripts/verify.mjs` proves it. License notices are in `THIRD_PARTY_NOTICES.md`.

**Looks in code and film direction:** adapted from the MIT parts of
gbro-collage-broll, ClaudeAnimationBase and lemo-opuscar. onetake (noncommercial)
contributed ideas only, written from scratch.
- `references/code-looks.md`: one material look per page or film:
  - honest thermal false colour (baked, scan resolve, cooling);
  - print (halftone, overprint, misregistration);
  - a paper collage assembled from empty;
  - boil;
  - a style catalog by job.
- `references/film-direction.md`: how a code film reads as one piece:
  - a treatment, and a survivor carried across every boundary;
  - rhythm in numbers;
  - reads timed for the viewer (`holdFor` and `chatTimeline`, which also pace a
    phone or chat demo on a site);
  - acting as pure functions, an operated camera, transitions made of the medium;
  - free shutter blur, sound, review strips.

**Videos from the same world (not only HyperFrames):** the
[awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos)
library holds 700+ prompts behind viral Opus 5.5 videos, written as code
(Canvas, SVG, GSAP, Three.js). `references/opus-videos.md` covers four things:
- How to search it, plus starting points by job (business explainer, logo
  reveal, launch film, kinetic type, 3D scene).
- The anatomy that makes those prompts work, and a brief template filled from
  STEP 1.
- The **render contract** (`__duration`, `__seek(t)`, `__ready`).
- Engine choice: HyperFrames, Remotion, or this skill's own path.

On this skill's own path, `scripts/render-video.mjs` renders any contract page
to a frame-exact MP4 (puppeteer + ffmpeg), and `references/video-starter.html`
is a working example.

---

## STEP 0 - The interview (batched, structured, step by step)

Use the host's structured-question UI (AskUserQuestion) and batch questions.
Every creative question has a "you decide" escape hatch - if the user defers,
art-direct it yourself and keep moving. Never block on a design answer you can
make well. Ask:

1. **What are we building, and the one-line vibe?** Brand name, what it is,
   the feeling. Offer to invent the brand entirely. **Language and
   direction:** English LTR, Hebrew RTL, or bilingual - asked up front
   because it shapes fonts, layout, and every motion direction (see
   `references/rtl-hebrew.md`).
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
   - *Modern UI motion*: Magic UI components layered on any of the above -
     offer 3-4 by name from the brand pairings in `references/magicui.md`
     (for a trade: flickering LED grid, border beams as current, an animated
     beam circuit for the process, sparks).
   - *Tactile UI*: Kitchen pieces for the elements the site needs anyway -
     offer 2-4 from one material world in `references/kitchen.md` (for a
     trade: a pushable "Call now", a magnetic "send a photo" drop zone, a
     receipt-printer quote confirmation). Open `references/kitchen-demo.html`
     so the user can try them.
   - *Looks in code*: one material look from `references/code-looks.md` (for a
     trade: thermal for leaks or electrical faults, a halftone case file, a
     paper collage for an explainer, boil for a hand-made brand).
   - *Cinematic*: one signature technique from
     `references/cinematic-techniques.md` (for a trade: a spotlight lens over
     the hidden wiring or pipes, a poster-first video hero of real work, a
     ghost word behind the cut-out tool or product).
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
7. **A video from the same world?** A 15-30s brand film, logo sting,
   explainer or social clip, rendered from code (see the video path after
   STEP 4). Offer 2-3 starting points by job from `references/opus-videos.md`
   and show their live remakes. Skip it if the user only wants the site.

Then **pitch 2-3 named concepts** with concrete what-you-see walkthroughs
(narrate the scroll, not a thesis one-liner). Mark one "(Recommended)". Each
concept names its ONE signature (the thing a visitor would screenshot), 2-4
quiet supports, and at most one heavy technique (WebGL, a long pinned story).
No concept may be the default skeleton (hero, 3 stats, 3 steps, 3 cards, FAQ,
dark CTA band), and each must pass the swap test: with a competitor's name
swapped in, the page must stop being true (`references/landing-craft.md`
section 5).
Build only after a concept is chosen; if the user says "you choose", take the
recommended one and go.

## STEP 1 - Art-direct the world

Commit before coding: exact palette hexes, a display+body type pairing with
real character (never default system fonts), an inline-SVG logo lockup, motion
feel, section rhythm. One distinct world per brand - never ship two brands that
look like the same site. For Hebrew/RTL builds, choose from the Hebrew
pairings in `references/rtl-hebrew.md` (Karantina + Rubik, Secular One +
Assistant, Frank Ruhl Libre + Heebo, Suez One + Varela Round) - never Heebo
for both display and body.

**Media order:**
1. The client's own photos and footage.
2. Generated media, using the still and motion briefs in
   `references/landing-craft.md`: check frames at 0, 50 and 100% and that the
   edge colour equals the page background. Paired stills (a lens, before and
   after) come from one image plus an edit pass, so they stay aligned.
3. Otherwise, a type-led page.

Never stock CDNs or grey boxes. AI images never stand in for "our real work".

**Then write the build spec** (`references/landing-craft.md` section 2):
- Every element gets real values: fonts, tokens, `clamp()` sizes, tracking,
  durations and easings, the z-ladder and the five verify viewports.
- It names the LCP element, includes the real copy, and gives a repo path and
  weight budget for every asset.
- Run its consistency pass before any code.

STEP 2 builds exactly the spec. A change of mind goes back into the spec first.

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
- Hebrew/RTL builds: `dir="rtl"` + `lang="he"`, CSS logical properties,
  mirrored motion directions (marquees, slides, arrows, progress bars), no
  italics, descender-safe kinetic-type masks - the full RTL law is in
  `references/rtl-hebrew.md`.
- Copy style: confident, concrete, zero fluff. Never use long dashes (em or
  en) anywhere - hyphens or rephrase.
- Porting from the local VidTSX library: read the source .tsx first, extract
  the motion math, apply the frame-to-live conversion rules in
  `references/example-library.md`, and rethink it for the brand. Never paste a
  library component into a site verbatim. No sources on disk? Build from the
  distilled techniques in `references/motion-patterns.md` instead.
- Magic UI components: port or install per `references/magicui.md` -
  SEO-critical pages port to vanilla so every word stays in static HTML;
  credit Magic UI in a source comment; never hide the LCP headline behind an
  entrance animation; decorative layers use fixed offsets so font swaps
  cannot shift layout.
- Kitchen components: build from the recipes in `references/kitchen.md`.
  - The real words stay in static HTML (a scramble only decorates them).
  - Tilt and glare only on `(hover: hover) and (pointer: fine)`.
  - Masked or clipped shapes take their shadow from a parent `drop-shadow`.
  - A loader never gates LCP.
  - Never put a hold-to-confirm on the primary CTA.
  - Do not copy Kitchen source into a public repo: it has no license.
- Cinematic techniques: build from the recipes in
  `references/cinematic-techniques.md`.
  - One signature per page.
  - Its per-frame work joins the site's one rAF loop, never a second loop.
  - Browser APIs (`matchMedia`, observers, `Image`) only inside effects, or the
    prerender crashes.
  - A video hero's poster `<img>` is the LCP. No video byte loads before
    `load` plus idle, and Save-Data, 2g and reduced motion never download it.
- Looks and timing (`references/code-looks.md`, `references/film-direction.md`):
  - A look is baked on a site: no filter value changes per frame. Animating
    it means crossfading baked states.
  - Thermal heat is placed by a painted mask, with the physics' sign: damp
    and cold leaks read cooler, and hot lines warmer. It is labelled as an
    illustration, with no degree numbers unless they were measured.
  - A chat or phone demo is timed from the reads (`chatTimeline`): Hebrew
    holds letters / 11 + 1.5 s.
  - A background loop rests about 40% of the time.
- Performance is a design constraint: before shipping, the build must pass
  the jank bar in `references/perf-playbook.md` (rAF deltas, max < 50ms).
- Structured data for every real business: the JSON-LD `@graph` in
  `references/seo-schema.md`.
  - The most specific `LocalBusiness` subtype, one business node with a stable
    `@id`, kept in one source file that every page injects (never a second block).
  - Built from one `ROOT` constant.
  - It must match the visible page and the Google Business Profile.
  - `FAQPage` is generated from the visible FAQ, and no reviews or claims are
    ever invented. Google retired FAQ rich results on 2026-05-07: keep the
    markup if it is accurate, but never promise a FAQ result.
- **Search and AI answers from the first commit** (`references/seo-geo.md`):
  - Every word, the title, description, canonical, robots and JSON-LD are in
    the prerendered HTML: most AI crawlers run no JavaScript. One head per
    route. Count hydration mismatches: `hydrateRoot(root, app,
    { onRecoverableError })` increments `window.__hydrateErrors`.
  - Answer first: each service gets a section under a question heading whose
    first 40-60 words answer it, with client-confirmed facts. The answer and
    the offer come before a long cinematic scroll.
  - The hero paints from HTML and CSS alone: the LCP image is an `<img>` in
    the markup with `fetchpriority="high"`, never lazy; an entrance animation
    decorates the h1, never delays its first paint.
  - A static `robots.txt` that admits search and AI search crawlers
    (Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot) with
    an absolute `Sitemap:` line. A training opt-out is the client's call.
  - No catch-all rewrite: unknown paths return 404. No `llms.txt` on a local
    business site (Google ignores it). Never `pushState` on scroll.
  - Controls are native and named, nothing focusable hides inside
    `aria-hidden`, and decorative layers get `pointer-events: none`: that is
    what browsing agents and screen readers both act on.
  - Only free tools and data: nothing that costs the user or the client money
    goes on a site or into the workflow.

## STEP 3 - The responsive law (never skip)

A build is not done until this sweep passes, measured, not eyeballed.
`scripts/verify.mjs` runs items 1-3 plus the jank probe and saves per-viewport
screenshots; run it against the served production build.

1. **Five viewports minimum**: 390x844, 768x1024, 1024x768, 1440x900,
   1920x1080.
2. **Zero horizontal overflow** at every viewport, checked programmatically
   (`scrollWidth - innerWidth <= 0`) at multiple scroll depths (0%, 30%, 75%,
   95%), not just at the top. On RTL builds, overflow escapes to the LEFT and
   this check can read 0 while content is cut - also verify the left edge per
   `references/rtl-hebrew.md`.
3. **Fixed chrome collision check** on the smallest viewport - logos,
   nav, and readouts must not overlap; hide or collapse elements below
   600px rather than letting them collide.
4. Fluid type via `clamp()`; grids collapse to one column below ~900px; wide
   content scrolls inside its own container, never the page body.
5. Screenshot every major section at phone + desktop and **actually look at
   them**. `scripts/verify.mjs` saves them in scroll order with the section
   name, plus a mid-scrub frame for any pinned scene taller than 1.5
   viewports - a sticky scene judged only at its top edge is not judged at
   all. Reading the filenames is not reviewing: open the images.
6. **Accessibility floor**: sr-only text behind kinetic/canvas headlines
   (decorative layers get `aria-hidden`), visible focus styles, contrast
   floors (4.5:1 body, 3:1 large display type), alt text on every image.
   The `prefers-reduced-motion` path from STEP 2 is part of this floor.
7. **Headings must read as text, not just render as pixels.** Split or masked
   type (per-word masks, per-letter staggers) can look perfect while its
   `innerText` is missing every space - screenshots cannot catch it. Read the
   heading text dump from `scripts/verify.mjs` and confirm the words are
   actually separated. Fix by emitting real space text nodes between the
   spans, never by faking the gap with padding or margin.
8. **In-page anchors must clear fixed chrome.** Any site with a sticky nav
   and `href="#section"` links needs `scroll-padding-top` on `html` greater
   than the nav height, or the anchor target lands underneath it.
   `scripts/verify.mjs` checks this.

## STEP 4 - Verify and ship

- **Dev contract** in every build: `?jump=<scrollY>` lands pre-scrolled and
  settled; `window.__ready = true` fires only when truly ready. Screenshot via
  puppeteer-core + system Chrome (host preview panes throttle hidden tabs).
- **Jank test**: rAF deltas, judge p95/max (target max < 50ms), never average
  fps. A classic spike source: reading pixels back from a GPU-backed canvas
  every frame - sample from the decoded source image instead.
- **OG / social card - MANDATORY, never optional.** Every site ships with a
  social card and the full tag set. A link with no preview looks broken the
  moment it is pasted into LinkedIn, WhatsApp, Slack or iMessage, which is
  where these sites actually get shared. Screenshot the real hero at 1200x630,
  < 300 KB (`scripts/capture-og.mjs`), then emit the complete `og:` +
  `twitter:` set with **absolute** production URLs plus `rel="canonical"` -
  the exact required list is in `references/asset-pipeline.md`. Keep the card
  JPEG/PNG even on an all-WebP site: WhatsApp and LinkedIn render WebP
  previews unreliably. `scripts/verify.mjs` FAILS the build if a required tag
  is missing or the og:image does not resolve - do not ship around it.
- **Look and fix, then score.** When the sweep passes, open the screenshots
  (including `laptop-00-early.jpg`) and score them on the 10-criterion rubric
  in `references/landing-craft.md` section 5.
  - First the swap test (a gate, not a score), then the bar: an average of
    8+, nothing under 7. A self-score is not the client's verdict: when the
    client says "generic" or "AI slop", redo the concept, do not polish it.
  - Fix the three weakest with concrete value changes, re-run the sweep, and
    score again: up to 3 rounds.
  - Report the final score table next to the deploy URL and the audit
    verdict. If the bar is still missed, say what would lift it (real
    footage, real proof).
- **Defects found in verification**: fix them in parallel passes, one focused
  pass per defect, each with a precise brief: the defect, the viewport, the
  programmatic check that proves it, the acceptance bar, and screenshot proof
  after the fix. Then re-run the full sweep: a fix that breaks another
  viewport is not a fix.
- **Structured data**: `scripts/verify.mjs` parses every JSON-LD block and FAILS
  on invalid JSON, an `@id` defined twice, a telephone the page does not link
  to, or a FAQ question that is not visible. Then check the live URL in
  Google's Rich Results Test.
- **SEO, GEO and performance**: the same sweep reads the page four ways and
  FAILS on what breaks search or agents:
  - The raw HTML before JavaScript (an empty h1 fails), and raw against
    rendered (canonical, robots or JSON-LD that change after JS fail).
  - Canonical and indexability, robots.txt read the way crawlers read it, the
    sitemap's URLs, soft 404s, hreflang, broken internal links.
  - Unnamed controls in the accessibility tree, and controls covered by an
    invisible layer at 390px (taps miss them).
  - A throttled phone load: LCP with its four subparts, CLS session windows,
    image weight.
  WARN lines are judgement calls; read them, they never fail the build.
- **Test only what you own.** Point the sweep, screenshots and Lighthouse at
  a local build, a preview or the demo copy, never at a client's live
  production domain: automated loads fire the client's analytics and ad
  pixels and pollute their data.
- **Security gate before any deploy**: run the exposure audit (secrets, PII,
  personal emails, EXIF, local paths) and only publish on PASS.
- Deploy a lean build dir to the user's Vercel; report the production URL and
  the audit verdict table.
- **Once the real domain is live**, run the launch checklist in
  `references/seo-schema.md`:
  - Redirect old hosts to the canonical domain.
  - Search Console: Domain property, sitemap, request indexing.
  - Bing Webmaster Tools.
  - An IndexNow ping from the deploy script.
  - Links in from the Google Business Profile and socials.
  - Search Console's "Search generative AI" control left on Include, Bing
    Places with the same name, phone and area, and Lighthouse's agentic
    category at 2/2 (`npx lighthouse@latest <url>
    --only-categories=agentic-browsing`). The full list is in
    `references/seo-geo.md` section 8.

## Video path - animations and films from the same world (optional)

Use it when the user wants a video (a brand film, logo sting, explainer, launch
clip, social reel or OG video), whether alongside the site or on its own. Full
detail is in `references/opus-videos.md`.

1. **Pick the engine.**
   - Code-rendered design is this skill's own path.
   - Narration, captions, TTS or a long multi-scene edit go to the HyperFrames
     skills if installed.
   - A React team or a VidTSX composition goes to Remotion.
   - Photoreal footage is an AI video model's job, not code.
2. **Brief from the art direction.**
   - Choose a starting point by job from the prompt library and watch its
     remake.
   - Fill the brief template with STEP 1's palette, fonts and logo: hard specs,
     a one-line concept, a 1s hook, a beat grid, a banned list, a loop, and the
     build contract.
   - Adapt the borrowed prompt, never obey it, and credit its creator in the
     composition.
   - Direct it with `references/film-direction.md`:
     - three candidate structures, then a beat sheet with a carry and a reads
       column;
     - shot lengths varying (coefficient of variation >= 0.25), a quarter of
       the frames still;
     - one material look from `references/code-looks.md`.
3. **Build one self-contained HTML composition** that implements
   `__duration`, `__seek(t)` and `__ready`, with every frame a pure function of
   `t` and seeded randomness. Start from `references/video-starter.html`.
4. **Preview, then render.**
   - `node scripts/render-video.mjs comp.html out.mp4 --size 1080x1920 --preview`
     writes three stills: check the layout and the loop seam.
   - Then render the full film, with `--audio` for a licensed track.
   - Make a contact sheet with ffmpeg and actually look at it, plus a strip
     for every carry and seam (`film-direction.md` section 10).
   - Add `tmix` shutter blur for fast moves on the final render only.
5. **Same gate as a deploy:**
   - Real claims only.
   - No PII on screen.
   - Metadata stripped (the renderer does this).
   - Report the audit verdict.
   - On the site, a video gets a poster, `muted playsinline loop` and the
     reduced-motion pause, and never blocks LCP.
