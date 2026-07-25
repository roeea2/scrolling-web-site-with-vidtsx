# Motion patterns - proven techniques, ready to port

Production-tested motion patterns for premium TSX sites. Each entry: what it
looks like, when to use it, the core technique, and pitfalls. Where a full
Remotion source exists in the local VidTSX library, the file is named - read
it via `example-library.md` before porting. All patterns obey tsx-motion-law:
refs + rAF, seeded randomness, transform/opacity only.

## 1. Scroll-film crossfade

What: a pinned 300vh section where 3 "acts" (full-bleed image + caption)
crossfade as you scroll, like a film scrubbed by the wheel.
Use: winery/travel/heritage brands, any "journey" narrative.
Technique: sticky stage, scroll progress p in [0,1]; act i owns the window
[i/3, (i+1)/3]; opacity ramps in over the first 15% of its window, out over
the last 15%; slight scale 1.04 -> 1 while active.
Pitfalls: never swap `display`; keep all acts mounted and toggle
opacity/transform. Images must be preloaded or the first scrub stutters.

## 2. SVG stroke-draw on scroll

What: line art (floor plans, routes, signatures) draws itself as you scroll.
Use: architecture, process diagrams, maps, logos.
Technique: set `pathLength="1"` on every path, `stroke-dasharray: 1`,
`stroke-dashoffset: 1 - p` (p = scroll progress, possibly staggered per
path). The pathLength trick removes all getTotalLength math.
Pitfalls: round linecaps hide the dash joints; draw order should follow the
narrative (rooms, then doors, then labels).
Source: Sine_Wave_Visualization_v1 for a time-driven variant.

## 3. Particle-converge hero

What: thousands of particles fly in and snap into the wordmark, hold,
dissolve.
Use: portfolio hubs, event sites, big brand moments.
Technique: offscreen canvas, draw the text once, `getImageData` once, sample
pixels on a grid as targets; particles spring-integrate toward targets
(v += (t - p) * k; v *= damping), phases converge/hold/dissolve on a timer.
Pitfalls: sample pixels ONCE (see perf-playbook #3); seeded RNG for start
positions; cap particle count on mobile (halve the grid step).

## 4. Per-letter jump physics

What: headline letters hop in from off-screen with parabolic arcs,
squash-and-stretch, ground shadows, then idle-bounce.
Use: playful/dev-tool/kinetic heroes.
Technique: `jumpArc(p) = -4p(1-p)` for the hop height; squash factor from
`d = min(p, 1-p) * 2` bands (takeoff stretch, landing squash); shadow
opacity/scale by ground proximity; per-letter seeded config (delay, hops,
arc height); idle = sine bounce with per-letter phase.
Pitfalls: reserve vertical space so arcs never clip; Hebrew/RTL needs
descender-safe masks (see rtl-hebrew.md).
Source: TypographyJumpers_v1.

## 5. Convergence grid (scatter to order)

What: floating chips/cards start scattered and rotated, then fly into a
clean grid as you scroll through a pinned scene.
Use: "chaos to clarity" narratives: features, integrations, signals.
Technique: sticky 300vh; per-item seeded scatter transform; target = grid
slot computed from container size; `lerp(scatter, target, ease(p_i))` with
per-item stagger; heading crossfades mid-scene; progress bar scaleX(p).
Pitfalls: compute grid slots from live container size (resize-safe); keep
DOM order = reading order for a11y.
Source: DataFlowPipeline_v1 (adds packets traveling between nodes).

## 6. quickTo parallax

What: layered shapes/images drift at different rates with buttery lag.
Use: hero depth, ambient backgrounds.
Technique: one rAF loop; per-layer `current += (target - current) * 0.08`;
write `translate3d` to refs. This replaces scrub-linked tween libraries for
scroll effects and is the single biggest jank fix in perf-playbook.md.
Pitfalls: never create tweens inside the loop; lerp factor is frame-rate
dependent, so scale by dt for strict correctness.

## 7. Count-up and staged progress

What: numbers count up when scrolled into view; loaders that feel real.
Use: stats bands, social proof, "building your dashboard" interludes.
Technique: IO trigger once, `easeOutCubic(p)` over ~1.6s, tabular-nums.
For fake progress, use staged uneven ranges (0-23-45-78-94-100 across
uneven windows) instead of linear: instantly believable.
Pitfalls: format with locale separators; lock layout width so digits do not
shift the layout (ch-width or tabular-nums).
Source: The_RenderHook_v1 (staged), FollowerMilestone_v1 (count-up).

## 8. Packet-flow pipeline

What: nodes (pipeline stages) connected by lines, with packets traveling
between them; nodes light up as packets arrive.
Use: PM/devops/data products, any "how work flows" story.
Technique: stages as config array (id, label, position); packet progress via
modular time `((t + offset) % cycle) / cycle`; position = lerp along the
connector; node activation when any packet is within radius; works
time-driven (hero loop) or scroll-scrubbed (journey scene with a task chip
traveling the whole pipeline).
Pitfalls: keep the graph data-driven; draw connectors as SVG paths and
sample points along them (pathLength trick works here too).
Source: DataFlowPipeline_v1.
