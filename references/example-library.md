# VidTSX example library - local sources with port notes

26 Remotion TSX compositions live locally at:

`~/documents/hermes_projects/vidtsx-library/`

This catalog is the committable index. The .tsx sources stay local (never
commit them to the public repo). `example-gallery.md` is the abstract idea
menu; THIS file is for when you want the real motion math behind an idea.

## How to use during a build

1. STEP 0 (interview): when the user's market or vibe matches an entry below,
   offer it BY NAME ("we have the source for a pipeline flow, tasks as packets
   through stages - want that as your sticky scene?").
2. STEP 2 (build): READ THE SOURCE FILE before writing any code. Extract the
   motion math, rethink it for the brand, port it. Never paste a component
   verbatim.

## Frame-to-live conversion rules (apply to every port)

- `frame` becomes either (a) seconds in a rAF loop (`t * fps`) for time-driven
  heroes, or (b) scroll progress `p * totalFrames` for sticky scrub scenes.
- `interpolate(x, [in...], [out...], {easing})` becomes a tiny clamp01 + lerp
  helper, or `Easing.bezier` becomes `cubic-bezier(...)` in CSS.
- `spring()` feel maps to `cubic-bezier(0.34, 1.56, 0.64, 1)` CSS, or velocity
  integration inside the rAF loop.
- `Sequence` becomes per-element delay offsets. `AbsoluteFill` becomes a
  section with position:relative.
- `random()` is Remotion's seeded random; use mulberry32 locally. Never
  `Math.random()` in render paths.
- Drop `<Audio>` entirely. Swap `<Img>`/staticFile for brand assets.
- Write to refs inside rAF; React renders structure, never frames.

## Recurring idioms worth stealing (cross-file)

- Entrance triple: opacity [0,1] + translate [x,0] + scale [0.9,1] on one
  input range, 15-40 frames long.
- Overshoot-settle: 3-point input range with out [0, 1.2, 1] (gauge fills,
  success states, logo pops).
- Idle loops: `Math.sin(frame * k + i * phase)` mapped through [-1, 1] for
  floats, pulses, shimmers. Modular `(frame % cycle)` for repeats.
- PHASE const + sec() timeline (Airplane, GradientDescent): maps directly to
  sticky-scene scroll segments.
- Particle systems: config array with per-particle delay/duration/opacity,
  progress window [0, 0.2, 0.8, 1] for fade-in-out.
- SPRING_PRESETS (SpringAnimations_v1): bouncy/snappy/smooth/heavy/wobbly/
  elastic with real damping/mass/stiffness numbers - lift these into any
  entrance system.

## Quick match: site need -> source file

- Kinetic hero headline: TypographyJumpers, The_RenderHook, ProfessionalLogoReveal
- Product hero / launch: ProductLaunch
- Dev-tool UI mockup: TerminalInstallCTA, CodeAnimation
- Before/after or product compare: ComparisonSlider
- Chat/social/testimonial UI: ConversationBubbles, QuoteCard
- Feature carousel: Tip_Hack_Carousel_v2 (vertical), Tip_Hack_Carousel_Horizontal
- Stats band / count-up: FollowerMilestone, TenKCelebration, Poll_Results, ThermometerGauge
- Process/pipeline sticky scene: DataFlowPipeline, GradientDescentAnimation
- SVG draw-on-scroll: Sine_Wave_Visualization
- Parallax scene with traveling object: AirplaneOverForest001
- 3D hero (r3f): SolarSystem, WindmillAtSunset
- Retro/playful easter egg: RetroSideScroller, PixelCharacterWalk, SideScrollerGame
- Spring feel reference: SpringAnimations
- Educational counter: BinaryLightSwitches

---

## Hero / brand

### TypographyJumpers_v1 (649L)
Letters hop in from off-screen with parabolic arcs, squash-and-stretch, ground
shadows, idle bounce; chaos glyphs drift behind; dust off the ground line.
Signature math: `jumpArc(p) = -4p(1-p)`, `calcSquash` on min(p,1-p)*2,
per-letter LETTER_DATA (delay, jumpCount, jumpDur, startSide, idleHF).
Port: kinetic hero headline, time-driven rAF. PORTED to Meridian hero (see
saas-meridian) - read that port as the reference conversion.

### ProfessionalLogoReveal_v1 (473L)
buildUp -> reveal -> settle phases; glow pulse loop `(frame-revealEnd)%60`;
scale 0 -> 1.15 overshoot -> 1; light sweep translateX -90 -> 0.
Port: hero logo/wordmark moment on load, ~2s.

### ProductLaunch_v1 (720L)
Glow orbs on delay+120/+240 fade cycles, rising particles, intro slide 60->0,
badge + CTA. 34 interpolations, has Audio (drop it).
Port: product hero or "now live" announcement band.

### The_RenderHook_v1 (756L)
Fake progress counter with staged ranges (0-23-45-78-94-100 across uneven
frame windows) plus hook text beats.
Port: loading-style hero intro or stats-section opener. The uneven-stage
percent is the trick - feels real, costs nothing.

## UI mockup / product sections

### TerminalInstallCTA_v1 (628L)
Terminal window scale-in 0.9->1, typed command char-by-char, success check
with 1.2 overshoot, dot-grid backdrop fade, particle burst on success.
Port: install/quickstart section for dev tools. PORTED to Meridian (typewriter
terminal) - reference conversion available.

### CodeAnimation_v1 (519L)
Code typing via frame -> char count (0 -> totalChars), THEMES presets for
syntax colors. Minimal (4 interpolations), all feel is in pacing.
Port: docs sites, API sections.

### ComparisonSlider_v1 (764L)
Before/after panels; divider reveal 0->50, slide 50->85, settle back 85->50
(the attention wiggle - steal this); items slide from +/-30 with 0.9 scale.
Port: before/after section. Make divider scroll-scrubbed or pointer-draggable.

### ConversationBubbles_v1 (875L)
Chat bubbles alternate sides, enter from +/-50px with 0.8 scale, typing
indicator, per-bubble lifecycle windows [start, start+15, end-15, end].
Port: support/social/testimonial sections; trigger each bubble on scroll
entry instead of one timeline.

### Tip_Hack_Carousel_v2 (646L) + Tip_Hack_Carousel_Horizontal_v1 (676L)
Card carousel: enter 400->0 with rotate 15->0, exit 0->-400 with 0->-10;
background hue rotates 0->360 over 450 frames; floating particles.
Port: features/tips carousel. Horizontal variant for wide cards.

## Data / education

### GradientDescentAnimation_v1 (888L)
PHASE timeline (TITLE_IN, SURFACE_IN, BALL_APPEAR, DESCENT, CELEBRATE). SVG
surface curve draws in, ball descends the curve to the minimum, celebration.
Port: sticky "how it works" data story. Scrub ball position with scroll p;
the curve path math (sample y from x) is reusable for any path-follow.

### Sine_Wave_Visualization_v1 (468L)
Wave draws progressively (phase sweep 0 -> 2pi over frames 50-295), axes and
labels stagger in. Pure SVG.
Port: any SVG line-draw-on-scroll (same math as floor-plan draws on Atelier
Nord).

### Poll_Results_v1 (500L)
Question entry -50->0, bars reveal staggered, winner pulse (opacity flashes
0.15/0.1), vote count-up.
Port: stats band, survey/social-proof numbers.

### ThermometerGauge_v1 (780L)
Fill overshoots to target*1.1 then settles back (anticipation idiom), sine
shimmer on the fill, milestone ticks staggered at 80+i*20.
Port: KPI / progress / fundraising gauge.

### BinaryLightSwitches_v1 (665L)
Sequence-driven bit toggles counting 0-15, INTRO/NUMBER/OUTRO structure with
per-number timing consts.
Port: playful educational counter or "how it works" interlude.

## Scene / ambient

### AirplaneOverForest001_v1 (837L)
PHASE pattern; multi-layer SVG parallax drifting 0->800; plane path
x: -200->960->2200, y: 600->380->320, bank -8->0->5 deg, scale 0.6->1->1.1.
Port: parallax hero with a traveling focal object (car, bird, product).

### DataFlowPipeline_v1 (928L)
Stages as nodes, packets flowing along connector lines, stage activation as
packets arrive. PORTED to Relay (pm-relay) as hero + scroll-scrubbed journey
scene - the reference conversion for packet-progress math.

### SolarSystem_v1 (906L, r3f)
Orbiting planets, per-planet camera focus via progress-driven radius/height
pairs (100->60, 60->40...).
Port: 3D hero with camera-on-rails tour.

### WindmillAtSunset_v1 (542L, r3f)
Nature scene: windmill blades turning, gradient sky, low-poly hills.
Port: calm 3D ambient hero; pair with the 3D law in tsx-motion-law.md.

## Celebration / social proof

### FollowerMilestone_v1 (1008L)
PLATFORM_THEMES, count-up over 180 frames, confetti + fireworks + stars,
explosion window [0, 0.3, 1] -> [1, 1, 0]. Uses spring() for the number pop.
Port: social-proof counter section.

### TenKCelebration_v1 (543L)
Digits assemble from scatter (per-piece initialX/Y -> final, rotation 360->0,
spring scale), confetti burst, sine idle float `Math.sin(frame*0.15 + i*0.3)`.
Port: milestone stat moment (users, sites, years).

### QuoteCard_v1 (960L)
STYLE_PRESETS theming, card entry, word-by-word highlight
(wordStartFrame + framesPerWord*0.8), rising particles 110->-10.
Port: testimonial section with scroll-driven word highlight (same idiom as
the Aurelia philosophy pin).

## Retro / playful

### RetroSideScroller_v1 (354L)
GROUND_Y/BLOCK_Y world coords, obstacles scroll past, jump arc on input beat.
Port: playful 404 page or footer easter egg.

### PixelCharacterWalk_v1 (525L)
CHARACTER_PIXELS grid rendered as divs, walk cycle, footprint trail.
Port: brand mascot moment, loading interstitial.

### SideScrollerGame_v1 (263L)
Sprite-sheet driven (ASSETS config, BACKGROUND_DIMENSIONS, SPRITE_CONFIG).
Only port when the brand has real sprite assets; otherwise prefer
PixelCharacterWalk's pure-DOM approach.

## Feel reference

### SpringAnimations_v1 (545L)
SPRING_PRESETS with real numbers: bouncy (d8 m1 k150), snappy (d15 m0.5 k300),
smooth (d20 m1 k100), heavy (d25 m3 k80), wobbly (d5 m1 k100),
elastic (d3 m0.5 k200). Demo grid applies each to entrances.
Port: not a section - a palette. Pick a preset per brand personality and
apply it across that site's entrances for a consistent feel.
