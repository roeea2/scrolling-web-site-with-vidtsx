# TSX motion law - the full rules

Distilled from the VidTSX project guide (Remotion 2D/3D video generation) and
adapted for live websites. Two contexts share one discipline: deterministic,
frame-or-time driven, GPU-friendly motion. TSX examples for both live at
https://vidtsx.com.

## Context A - Remotion video components (rendered video, not the site)

When the user wants an actual rendered video (intro, social clip, product
reveal) alongside or inside the site:

- Composition config: PascalCase id, explicit `durationInSeconds`, fps 30 (2D)
  or 60 (3D); presets 1920x1080 / 1080x1920 / 1080x1080.
- Animate ONLY from `useCurrentFrame()` + `interpolate()` / `spring()`.
  `inputRange` must be strictly monotonically increasing.
- FORBIDDEN inside video components: `useState`, `useEffect`, `setTimeout`,
  CSS animations, `Math.random()` (use seeded functions), the
  `Easing.out(Easing.cubic)` wrapper form (use `Easing.bezier(...)`),
  non-existent `@remotion/paths` helpers like `makeCircle()`/`makeRect()`
  (only `evolvePath`, `getLength`, ... exist), and post-processing passes
  (BokehPass, UnrealBloomPass) - simulate with fog + emissive materials.
- 3D: always `time = frame / fps`, never raw frame counts; pre-compute
  procedural data in `useMemo`; InstancedMesh for 50+ identical objects;
  ~500 mesh ceiling; 3-point lighting (ambient + directional key +
  hemisphere fill).
- Typography hierarchy: headlines 72-120px weight 700-900, subheads 36-48,
  body 28-36.
- `import * as chroma from 'chroma-js'` (namespace import, not default).

## Context B - Live site motion (the website itself)

- **The tick discipline**: one rAF loop owns per-frame updates and writes to
  DOM nodes via refs. React state changes only on discrete events (section
  enter, menu open). A `setState` per scroll tick is a rewrite, not a tweak.
- **Scroll progress**: `p = clamp(-rect.top / (rect.height - innerHeight))`
  on a tall driver with a sticky stage. Lerp toward targets
  (`current += (target - current) * 0.12..0.16`) for weight.
- **Canvas image sequences** (scroll-scrubbed film): pre-extracted JPEGs on a
  full-viewport canvas, ImageBitmap sliding window (decode off-thread around
  the playhead, close bitmaps outside it), DPR capped at 1.5, nearest-frame
  fallback. Never `<video currentTime>` scrubbing.
- **Sequence payload law**: extract at the footage's NATIVE width (upscaling
  draft footage buys bytes, not detail) and keep the whole sequence under
  ~8 MB. Load a sparse spine first (frame 0, then every 8th) so the film is
  scrubbable end to end within seconds, then backfill; the nearest-frame
  fallback covers the gaps. Reveal the page on spine-complete, never on
  full-load.
- **Decode discipline for bitmap windows**: cap in-flight `createImageBitmap`
  calls (~4), request them center-out from the playhead, and skip decoding
  entirely while the playhead is sweeping fast (|target - current| > ~6
  frames) - a fast scroll otherwise queues hundreds of decodes it immediately
  discards and wedges the main thread; the nearest-loaded-image draw covers
  transit. If the cap cuts a fill short, retry on later ticks.
- **Mass staggered reveals** (many glowing/shadowed elements animating at
  once): give each element `will-change: transform, opacity` so it becomes
  its own compositor layer and the shadow rasterizes once - otherwise the
  stagger repaints every glow every frame and drops a 100-200ms spike right
  when the section enters. Keep shadow stacks to 1-2 layers.
- **GPU readback trap**: never `getImageData` from the big GPU-backed canvas
  in the loop (pipeline stall = jank spike). Sample small analysis canvases
  from the decoded source image instead.
- **Particles**: one offscreen radial-gradient sprite drawn per particle;
  never `shadowBlur`. Seeded positions so renders are deterministic. Stop
  rendering entirely when the layer's alpha reaches 0.
- **Springs on entry**: CSS `cubic-bezier(0.34, 1.56, 0.64, 1)` with
  IntersectionObserver-added classes; stagger with transition-delay.
- **3D heroes** (react-three-fiber): same rules as Context A 3D, plus: mount
  once, animate in `useFrame` with elapsed time, and provide a static
  fallback under `prefers-reduced-motion`.
- **Ordering law with GSAP/ScrollTrigger**: create pinned scenes first,
  ambient/background triggers after - refresh order is creation order.
- **Scene handoffs**: exits keep ~45% presence at the boundary, entrances
  arrive half-formed, and a persistent ambient layer bridges quiet beats.
  Never let the visitor scroll through an empty black frame.

## Verification (both contexts)

- Dev contract: `?jump=<y>` + `window.__ready` gate for headless screenshots.
- Jank: rAF delta p95/max < 50ms; average fps hides spikes perfectly.
- Responsive sweep: 5 viewports, programmatic zero-horizontal-overflow at
  multiple scroll depths, chrome collision check under 600px.
