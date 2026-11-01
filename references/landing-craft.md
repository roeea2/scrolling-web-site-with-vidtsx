# Landing craft: the build spec, taste rules, anatomy and the look-and-fix loop

Adapted from MotionSites Web Builder (MIT), https://github.com/Motionsites-AI/claude-skill
(MIT License, Copyright (c) 2026 MotionSites. Only that project's MIT parts informed
this file: instructions, references, scripts. Its example prompts and media are not
MIT and nothing from them is used here.)

Average AI landing pages come from a vague plan, no real media, and nobody looking at
the result. This file fixes the first and the last (`cinematic-techniques.md` and
`asset-pipeline.md` the middle), under `tsx-motion-law.md`, `rtl-hebrew.md` and the
`magicui.md` LCP/CLS laws. Where MotionSites differs, the line says which rule won.

## 1. Where it slots in

STEP 0 ends with a chosen concept; STEP 1 commits palette, type, logo and motion feel.
**Then, still in STEP 1, write the build spec below**: 600-1,200 words for a hero,
1,200-2,500 for a full landing page. STEP 2 builds exactly the spec (a change of mind
goes back into the spec first). STEP 3-4 run `scripts/verify.mjs`, then section 5.

## 2. The build spec

### Precision rules
- **No adjective stands alone.** "Cinematic", "premium", "glassy" are followed by the
  values that produce them: blur px, alpha, gradient stops, durations.
- **Every visible element gets a full style line:** `clamp()` size, weight,
  line-height, tracking, colour token with opacity, max-width, margins.
- **Every motion gets** trigger, delay, duration, easing, from -> to, its reduced-motion
  end state, and whether it joins the shared rAF loop. Staggers are formulas:
  `delay = 0.3 + i * 0.12s`.
- **Every asset gets** a repo path (the client's own or generated), pixel size, weight
  budget and loading policy. Never a URL you have not fetched, never a stock or paid CDN.
- **Logic is steps with constants** (lerp factor, lock ms, thresholds, cleanup), and
  **the real copy is in the spec**, in the site's language. Never "headline here".

### Template
Fill every `{{ }}`. Write "none" rather than leaving a block blank.

````markdown
# {{Brand}}: {{one-line concept}}

## 0. Brief
Build {{a hero | an N-section landing page: Hero, ...}} for {{Brand}}, {{what, for whom}}.
Visitor: {{who lands here, from where (ad, Google profile, WhatsApp share), what they must believe}}.
Primary action: {{call | WhatsApp | book | buy}}. Secondary: {{softer action}}.
Signature (the ONE thing remembered): {{technique + where it lives}}.
Language: {{he RTL | en LTR | bilingual}}. Fidelity: build exactly this; add nothing unlisted.

## 1. Stack and budgets
Vite + React + TS, prerendered to static HTML, plain CSS custom properties.
Libraries: {{none | name@exact.version}}, pinned and bundled, MIT/OFL/Apache only. No CDN
scripts, paid fonts, icon sets, widgets or SaaS embeds.
Budgets: JS {{<= 120 KB gz for a 2D page}}, poster {{<= 250 KB}}, hero video {{<= 4 MB}},
page images {{<= 2 MB}}. LCP element: {{named, e.g. the hero poster img; on a
full-viewport plate Chrome skips the poster, so name the largest text block instead}}.

## 2. Fonts (self-hosted woff2, Google Fonts families under OFL)
| Role | Family | Weights | Used on |
|---|---|---|---|
| Display / Body / Labels (optional mono) | {{...}} | {{...}} | {{...}} |
Preload only the display weight used above the fold. `font-display: swap` plus a fallback
`@font-face` with `size-adjust` / `ascent-override`, so the swap cannot re-wrap the H1.

## 3. Tokens
```css
:root{
  --bg: {{hex}};            /* equals the hero media's edge colour */
  --fg: {{h s% l%}};  --muted: {{...}};  --line: {{fg at 10-20%}};
  --accent: {{one hue | none}};      /* only on: {{<= 3 element types}} */
  --ease-out: cubic-bezier(.16,1,.3,1);  --ease-spring: cubic-bezier(.34,1.56,.64,1);
  --ease-ui: cubic-bezier(.4,0,.2,1);
}
html,body{background:var(--bg);color:hsl(var(--fg))}   /* first rule: no white flash */
```
Opacity ladder over media: {{headline 100 / nav 80 / body 70 / labels 50}}.

## 4. Type scale
| Role | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| H1 | {{clamp(2.5rem, 1.6rem + 4.4vw, 6rem)}} | ... | ... | ... |
| H2, lede, body, label, stat | ... | ... | ... | ... |

## 5. Assets
| Slot | File | Source | Size / weight | Fit, focal point (LTR / RTL / phone) | Loading | Alt |
|---|---|---|---|---|---|---|
| hero-poster | public/media/hero-poster.webp | frame 0 of hero.mp4 | 1920x1080, <= 250 KB | cover; 70% 50% / 30% 50% / 50% 35% | eager, fetchpriority high | "" |
Art direction: {{what it shows, where the subject sits, the empty copy zone, edge colour, speed}}.
Text protection: {{none | eased bottom scrim | side scrim on phones}}.

## 6. Layers, nav, hero
Root {{min-height 100svh, 100vh fallback}}. z-ladder: media 0 -> scrims 1 -> content 10 ->
nav 20 -> menu 50 -> grain 60 (pointer-events none).
Nav: wordmark, 3-5 links, CTA with the hero CTA's label; phone menu {{type, timing,
closes on link / Esc / resize, body scroll locked}}.
| Element | Copy | Tag | Font | Size | Wt | LH | Tracking | Colour | Box | Motion |
|---|---|---|---|---|---|---|---|---|---|---|
| Eyebrow, H1 (breaks marked /), Sub, Primary CTA, Secondary | ... |

## 7. Sections (one idea each)
Per section: background, padding, container; eyebrow, heading, body with full style
lines; grid; card (radius, padding, material); media; reveal config.

## 8. Motion
| Element | Trigger | Delay | Duration | Easing | From -> To | Reduced motion | Loop? |
|---|---|---|---|---|---|---|---|
Entrance complete by {{<= 1.5s}}. LCP element painted at first frame, moved by transform
only. Not animated: {{...}}. Interaction logic: constants, steps, rAF subscriber, cleanup,
touch fallback.

## 9. Responsive (the verify.mjs viewports)
| Element | 390 | 768 | 1024 | 1440 | 1920 |
|---|---|---|---|---|---|
Short-laptop rule `(min-width: 901px) and (max-height: 760px)`. No horizontal scroll at 390.

## 10. SEO, static HTML, acceptance
`<title>` {{<= 60 chars}} / meta description {{<= 155}} / H1 / JSON-LD type
(seo-schema.md) / OG card (asset-pipeline.md). Words that exist only after JS: none.
Do not: {{...}}. Must: {{...}}.
First viewport at 390x844: {{one paragraph}}. At 1440x900: {{one paragraph}}.
````

### Consistency pass (before coding)
- Every asset exists on disk or has a generation brief (section 3, Media), and the page
  background equals the hero media's edge colour.
- No element carries conflicting values; every "do not" agrees with assets and layout.
- Every font is self-hosted, and preloaded only if it is above the fold.
- The LCP element is named and nothing in the motion table hides it.
- RTL: every horizontal motion, arrow and focal point has its mirrored value.

**Add-on modules** (append what matches; numbers refer to `cinematic-techniques.md`):
video hero (loop method, poster, focal point, scrim, preload policy: 1-3); cut-out or 3D
(per-role transform table, lock ms, preload, still fallback: 8, 9, 11); mega type (vw
size, line-height .75-.9, clipping, which words sit in front of the media); scroll story
(runway px, a table of scroll px -> what happens, per-layer transforms: 10).

## 3. Taste rules (numbers)

Defaults, not laws. Break one on purpose and say why in the spec.

### Composition
- **One idea per first screen:** mark, nav, H1, one sub, 1-2 CTAs, one media plane, at
  most one quiet strip (proof, logos or stats). Cards, stat grids and icon rows go below
  the fold unless they are the concept.
- **Anchor on purpose:** centred stack (safe, rarely best), bottom-anchored, one column
  (inline start, so right in RTL) or editorial corners.
- **Text and subject never collide.** Subject in one third, copy in the other or the
  empty band. Move the media (`object-position`, 110-120% oversize) before shrinking type.
- **Space:** sub max-width 28-42rem; gutters 20-24px phone, 48-64px desktop; sections
  `clamp(96px, 12vw, 176px)` vertical; content 64-80rem; hero copy 860-980px.
- **Depth from layering,** not decoration: a ghost word behind a cut-out, a spotlight
  lens over a second aligned image.

### Typography
| | H1 | Mega word | Body | Labels |
|---|---|---|---|---|
| Size | `clamp(2.5rem, 1.6rem + 4.4vw, 6rem)` | 14-28vw | 16-18px (Hebrew 17-18) | 11-13px |
| Line-height | .95-1.05 Latin, 1.0-1.1 Hebrew | .75-.88 | 1.5-1.6 Latin, 1.5-1.65 Hebrew | 1-1.3 |
| Tracking | -.02 to -.045em Latin, 0 to -.01em Hebrew | -.04 to -.07em | 0 to -.01em | +.15 to +.3em Latin caps, +.02 to +.06em Hebrew |
| Weight | 400-500 in a one-grotesk system | 800-900 | 300-400 | 500-600 |

- H1 is 5-6x the body size. Break headlines by hand into 2-3 lines; `text-wrap: balance`
  on H1/H2; `white-space: nowrap` per line on desktop only.
- **Archetypes:** serif display + neutral grotesk; one grotesk doing it all with size and
  space; heavy condensed mega words + calm body; mono micro-labels (10-12px, 40-60%) for
  indices `01 / 05` and eyebrows.
- **Accent words are muted, not brighter.** MotionSites sets them in italic serif; Hebrew
  has no italics (rtl-hebrew.md), so Hebrew accents use weight or the muted tone.
- **OFL faces that recur (self-host):** Instrument Serif + Inter, Inter + Outfit, Geist,
  Manrope, Anton + Inter, Space Grotesk + JetBrains Mono; Hebrew: rtl-hebrew.md only.
  Max 2 families plus a mono; no paid families. Gradient text: one element per page.

### Colour
- 1 background, 1 foreground, 1-2 greys, at most 1 accent on at most 3 element types.
  Monochrome plus media wins most often.
- Hierarchy from opacity steps (100 / 80 / 60 / 40), not new hues; borders fg at 10-20%.
- Page background = the media's edge colour: no overlay, no seam, no flash. Near-blacks
  `#050505`-`#0c0c0c`, off-whites `#f0f0ee`-`#fcfcfc`; tokens as HSL triplets so
  `hsl(var(--fg) / .6)` works; theme `::selection`.
- Banned unless the concept names them: purple/indigo gradients, glow orbs, blobs, a
  radial gradient as "the visual", heavy shadows (soft only: `0 4px 14px rgb(0 0 0/.16)`).
- Contrast floors (SKILL.md STEP 3) over the brightest frame behind the copy.

### Surfaces and components
- **One material, reused:** liquid glass or frost (cinematic-techniques.md 5) or one
  Kitchen material, defined once for nav, chips, cards and secondary CTAs.
- **Buttons:** primary solid and inverse, 14-16px weight 500, padding 12px x 24-32px, at
  least 44px tall; secondary ghost, glass or text link. One arrow nudge on hover (2px or
  -45deg), mirrored in RTL. Pills for actions, 20-40px radii for cards.
- **Credibility micro-components,** real data only: a badge with an inner chip, 3
  overlapping avatars + one line, 2-4 stats, a logo strip at 40-50% with edge fade.
- **Grain:** SVG fractal noise at .04-.15 effective opacity unifies video and UI.

### Motion
- **Entrance:** nav -> eyebrow -> H1 -> sub -> CTA -> strip, 80-200ms apart, starting at
  0-0.4s, all landed by 1.5s. Base move: opacity + translateY 20-30px over 0.6-1.1s.
- **LCP law wins over MotionSites:** their hero entrance fades the H1 up from opacity 0,
  which drops it as an LCP candidate. Here the hero H1 is painted at first frame and
  moves by transform only (cinematic-techniques.md 6). Non-LCP elements may start at 0.
- **Easing:** the house spring `cubic-bezier(.34,1.56,.64,1)` for small entrances
  (chips, badges, cards, checks), per SKILL.md; expo-out `(.16,1,.3,1)` for headline
  lines and media settles, where an overshoot reads as a bounce; `(.4,0,.2,1)` for state
  changes; linear only for marquees.
- **Durations:** hovers 150-300ms, menus 280-500ms, carousels 640-800ms, crossfades
  0.5-1s, count-ups 1.5-2s, media settle 1.8s. **Stagger:** 30ms characters, 50ms nav
  items, 60-100ms words, 100-150ms cards.
- **Lerp, always dt-scaled:** .1 cursor followers, .12 pointer parallax, .12-.16 pinned
  stages (tsx-motion-law.md), .08 ambient drift (motion-patterns.md 6).
- **Scroll reveals:** once, threshold .1-.25 (0 plus a rootMargin for blocks taller than
  about 6 viewports), y 20-40px, 0.6-0.9s. Class names contain `reveal` or `rise`, so
  verify.mjs's stuck-reveal check sees them.
- **Restraint:** hovers scale <= 1.05, `:active` .97; release entrance transforms when
  they end (`animation: none` on `.is-in`). Not animated: backgrounds, decorative layers,
  infinite pulses, shimmer on headlines. The media is the ambient motion.
- **Reduced motion:** final states, no smoothing, no autonomous movement; scroll-driven
  pieces keep the mapping. The rest state is visible if JS never runs.

### Media
- **Order:** the client's own -> generated -> a type-led page (mega word, grain, a static
  light falloff at <= 8% alpha). Never stock CDNs or grey boxes; self-host in `public/media/`.
- **Hero media that works:** one subject, one continuous slow shot; edges falling off to
  one flat colour (the page bg); an empty zone for the copy (left half, top 35-40% or a
  bottom band); 2-3 hues plus one highlight; no text, logos or UI in frame; loopable.
- **Still brief:** `[shot] of [ONE subject], [material], in the [right third], ~30% of
  frame, backdrop falling off to pure [hex] at every edge, [light], palette [2-3
  colours], empty [left half] for a headline, no text, no logos, 16:9`. **Motion pass:**
  `single continuous shot, camera locked or a 5% push-in, nothing enters or leaves frame,
  8-10s, last frame matches the first`.
- **Check frames at 0, 50 and 100%:** copy zone empty, edges equal the bg; fix with
  `object-position` or regenerate, never a flat dark wash. Paired stills (lens, planes)
  come from ONE image plus an edit pass, so they stay pixel-aligned.

### Copy
- **H1:** 3-9 words over 2-3 lines: a two-beat statement, a contrast pair or a
  three-word staccato. Specific, with a point of view. **Sub:** 1-2 sentences, 15-30
  words, a concrete benefit plus texture, muted.
- **Nav:** 3-5 links of 1-2 words. **CTA:** 2-3 words, verb first, repeated in the nav.
- **Never:** lorem, "Feature 1", emoji icons, long dashes, invented numbers or reviews.
  Hebrew is written natively; phones, prices and Latin names sit in `<span dir="ltr">`.

## 4. Anatomy that converts

1. **Hero:** who it is for, what they get, one action. The primary CTA is visible at
   390x844 without scrolling; on phones it is a real `tel:` or WhatsApp link.
2. **The signature:** one per page plus 2-4 quiet supports (an entrance, one material,
   one type move, a section reveal). At most one heavy technique; when two effects
   compete for attention (spotlight + magnet + parallax), cut one.
3. **Proof right after the hero:** real numbers, reviews, licences, service area,
   matching the JSON-LD and the Google Business Profile.
4. **Offer:** 3-6 services or products, each with its own image. **How it works:** 3-5
   steps (a convergence grid or a packet-flow pipeline). **Objections:** FAQ (feeds
   `FAQPage`), guarantees.
5. **CTA rhythm:** the same primary label in the nav, hero, after proof, after the FAQ
   and in the closing band. Phones may add a sticky bottom bar (>= 56px plus safe-area
   padding) once the hero CTA scrolls away.
6. **Footer:** name, address and phone matching the Google profile, hours, legal pages.

Fewer, stronger sections beat many weak ones: one idea, one heading, one visual each.

## 5. The look-and-fix loop

Run the sweep on the served production build, fix every FAIL, then open the
screenshots as images. Reading filenames is not reviewing.

```bash
node scripts/verify.mjs http://localhost:5199 shots/
```

**Blocking** (any one fails the page, whatever it scores): any verify.mjs FAIL; console
or page errors, failed requests, broken images, a video that should play but does not
(see the list below); a white first paint on a dark design; text unreadable over media,
under the contrast floors or clipped (Hebrew descenders); the H1 in a fallback face; a
nav on two lines or a desktop hero hiding its CTA; placeholder or invented copy. Most of
these are verify.mjs FAILs now; the rest you judge on the screenshots.

### Score 1-10 on each, judged on the verify.mjs output
| # | Criterion | A 10 looks like | Judge on |
|---|---|---|---|
| 1 | First glance | One focal point, clear in 3 seconds, reads studio-made | `laptop-01-*`, `phone-01-*` |
| 2 | Signature | One thing someone would screenshot and share | its section shots and `-mid` frame |
| 3 | Typography | Big confident display, calm body, max 2 families | laptop shots, heading text dump |
| 4 | Composition | Deliberate space, aligned edges, hero -> message -> CTA | all laptop shots |
| 5 | Colour and light | Small palette, one accent with intent, copy protected | laptop and desktop shots |
| 6 | Media integration | Cropped, placed and layered on purpose | `laptop-01`, `phone-01`, `desktop-top` |
| 7 | Motion | Entrance in 0.6-1.5s, physical interactions, no nagging loops, reduced motion honoured | code, `-mid` frames, early frame, jank line |
| 8 | Mobile | Type rescaled, media re-cropped, targets >= 44px, signature survives | `phone-*`, `tablet-*` |
| 9 | Copy | Specific, short, believable; verbs on CTAs | shots plus heading text dump |
| 10 | Polish | Hover and focus states, consistent radii, no shift as fonts and media load | a Tab pass, anchor-offset line |

RTL builds fold mirroring into 4, 7 and 8. **The bar: an average of 8 or more, nothing
under 7.** First builds usually land at 6-7.

**The swap test is a gate, scored before the rubric.** Replace the brand name with a
competitor's. If the page stays true, it is a template and it fails, whatever the ten
criteria average: polish scores cannot see sameness. (Learned the hard way: a plumber
landing scored 8.1 here and the owner's verdict was "it looks like AI slop".) The fix is
a new concept, not polish: make the page a thing only this business does, for example a
conversation, a report it really issues, or its real day.

**Template tells.** Two of these on one page mean redo the concept:
- the skeleton hero, then 3 stats, 3 steps, 3 cards, an FAQ and a dark CTA band;
- every section opened by the same dashed eyebrow and a two-tone "X. Y." heading;
- sections in threes;
- glass pills;
- numbers in rounded squares;
- rounded cards with soft shadows as the only component;
- slogan cadence (short fragments ending in periods) instead of a voice;
- generic AI photos with a "simulation" label on every one.

### Fix loop
1. Write the three weakest scores and, for each, the change in values: "H1 to
   `clamp(3.5rem, 2rem + 6vw, 8rem)`, tracking -.04em", "eased scrim over the last 25% of
   the plate", "stats into one row with 1px dividers".
2. One focused pass per defect (SKILL.md STEP 4), then re-run the whole verify.mjs: a fix
   that breaks another viewport is not a fix. Score again.
3. Up to 3 rounds. If the bar is still missed (weak footage, no real proof), tell the
   user what would lift it. Report the final scores as a table with the deploy URL.

High-impact fixes: **generic** -> bigger type, fewer words, a stronger signature.
**Busy** -> less decoration, unified radii, one spacing step up. **Flat** -> a media
layer, a scrim, grain, one material. **Text fights the video** -> copy to the calm zone
or a calmer clip. **Mobile broken** -> re-aim `object-position`, `clamp()` the type.

### What verify.mjs adds from MotionSites' shoot.py
These six checks came from their QA script and now run in every sweep:
1. **An early frame** 350ms after DOMContentLoaded at 1440x900 (`laptop-00-early.jpg`),
   and a FAIL on a white first paint under a dark design.
2. **Page errors, failed requests and HTTP >= 400** (a moved media file 404s silently),
   and **broken images** (`img.complete && img.naturalWidth === 0`).
3. **Video state per `<video>`:** a decode error FAILS; an autoplay video still paused
   after load is a WARN (it shows its poster and looks fine in a screenshot).
4. **Fonts:** the H1's computed family and size, and a FAIL if its face never loaded.
5. **Which elements overflow,** by selector, next to the px total.
6. **A real mobile context** (`isMobile` + `hasTouch`) for the phone and tablet shots,
   so `(hover: none)` matches and the touch branch of every effect is what gets judged.

Their codec note also holds: Playwright's bundled Chromium cannot decode H.264, so MP4
heroes stay black there. verify.mjs drives the system Chrome; keep it that way.
