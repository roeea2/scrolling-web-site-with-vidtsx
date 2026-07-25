# Performance playbook - jank sources and fixes

Measure first. rAF deltas during a scroll sweep, judge p95 and max, never
average fps. Bar: max < 50ms at p95 on a mid laptop. `scripts/verify.mjs`
runs this probe as part of the sweep.

## The usual suspects (ordered by how often they are the culprit)

1. **Scroll-tween libraries re-evaluating per scroll event.**
   Symptom: main-thread spikes exactly while scrolling, fine when idle.
   Fix: drop scrub tweens on scroll-linked effects. One rAF loop, lerped
   state, write transforms to refs (the "quickTo parallax" pattern in
   motion-patterns.md). Real case: 5 scrub tweens + a smooth-scroll bridge
   produced 192ms frames; the rAF rewrite measured p95 34ms, max 34ms.

2. **Per-frame object/tween allocation.**
   Symptom: sawtooth jank, GC pauses every few seconds.
   Fix: create setters/tweens once, reuse them. No `gsap.to()` or new
   objects inside the tick.

3. **Canvas pixel readback per frame.**
   Symptom: huge regular spikes with canvas particle effects.
   Fix: `getImageData` exactly once (or sample from the decoded source
   image), keep particle state in typed arrays, draw only.

4. **Animating layout properties.**
   `top/left/width/height/margin` in a tick or transition. Fix: transform
   and opacity only. For real layout changes, FLIP technique.

5. **Expensive paint regions.**
   Animating `box-shadow`, `filter`, large `backdrop-filter` areas, big
   blur radii. Fix: pre-render shadows as pseudo-elements and crossfade
   opacity; cap blur at ~20px; keep backdrop-filter to small chrome (navs).

6. **Too many observers and listeners.**
   An IntersectionObserver per element, scroll listeners without passive,
   resize handlers re-measuring everything. Fix: one shared IO per page,
   `{ passive: true }` on scroll/touch, ResizeObserver for size changes,
   cache rects outside the loop.

7. **Layout reads inside the loop.**
   `getBoundingClientRect` / `offsetTop` every frame forces sync layout.
   Fix: measure on resize/scroll-into-view, cache, read cache in the tick.

## Pre-ship checklist

- [ ] rAF delta probe passes (max < 50ms) at 1440x900 mid-scroll
- [ ] No tween/object creation inside any tick
- [ ] transform + opacity only in animated properties
- [ ] One shared IntersectionObserver
- [ ] Canvas readback happens once, not per frame
- [ ] `prefers-reduced-motion` disables rAF-driven effects, not just CSS
