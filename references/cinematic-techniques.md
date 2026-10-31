# Cinematic techniques: signature recipes for premium landing pages

Adapted from MotionSites Web Builder (MIT), https://github.com/Motionsites-AI/claude-skill
(MIT License, Copyright (c) 2026 MotionSites. Rewritten for this skill's laws; short
snippets adapted from its MIT technique library. Nothing from its examples or media.)

Eleven techniques this skill lacked (motion-patterns, magicui and kitchen cover kinetic
type, scroll-lit words, count-ups, marquees, spotlight cards, scramble). Pick ONE as the
page's signature (`landing-craft.md` section 4); the rest support it.

| # | Technique | Signature for | Cost |
|---|---|---|---|
| 1 | Video hero plate, poster-first | any footage-led hero | medium |
| 2 | Seamless loop | a clip with a visible cut | none-light |
| 3 | Text over media: eased scrim, progressive blur, grain | copy on footage or photos | light |
| 4 | Pointer-scrubbed turntable | a product that should turn like a live object | medium |
| 5 | Liquid glass material | UI floating over moving media | light-medium |
| 6 | Focus-in headline, LCP-safe | a display headline that exhales in | light |
| 7 | Spotlight lens | two aligned images where the hidden one is the point | light-medium |
| 8 | Ghost word behind a cut-out | poster composition, no runtime cost | light |
| 9 | Depth carousel | 3-6 products or packages, each with its colour | light-medium |
| 10 | Layered scroll story | destination, launch, heritage | heavy |
| 11 | GLB product hero | hardware, packaging, tools, collectibles | heavy |

## The shared contract (every recipe)

- **Markup is JSX that prerenders:** every word and `alt` is in the static HTML. A recipe
  is `mountX(el): () => void`, run as `useEffect(() => mountX(ref.current!), [])`, with
  `matchMedia`, observers and `Image` inside it (module scope crashes the prerender).
  Media queries are read once at mount, never in a tick.
- **One loop, transform and opacity only:** per-frame work joins the ticker below (or the
  site's loop); never React state per frame. A "blur" or "tint" animation is a crossfade
  between a static blurred or tinted layer and the clean one.
- **Pointer effects** only on `(hover: hover) and (pointer: fine)`; touch gets a drift,
  drag or still. **Reduced motion:** final state, no smoothing or drift; user-driven
  mappings stay. **RTL:** narrative horizontal motion takes `dir` (-1 in RTL) and CSS
  mirrors with `[dir='rtl']` attribute selectors, never `:dir()` (rtl-hebrew.md);
  physical motion (a drag, symmetric curtains) never mirrors.
- **Free and self-hosted:** own or generated media in `public/media/`, libraries pinned
  and bundled, no CDN. One heavy technique (WebGL, many full-bleed layers) per page.

```ts
// src/motion/ticker.ts: the one rAF loop. A subscriber returns true while it still moves.
export type Tick = (now: number, dt: number) => boolean | void;
const subs = new Set<Tick>();
let raf = 0, last = 0;
function frame(now: number) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now; raf = 0;
  let busy = false;
  subs.forEach((f) => { if (f(now, dt)) busy = true; });
  if (busy && !raf) raf = requestAnimationFrame(frame);           // sleeps once everything settles
}
export const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
export const addTick = (f: Tick) => { subs.add(f); wake(); return () => void subs.delete(f); };
export const follow = (k: number, dt: number) => 1 - Math.pow(1 - k, dt * 60);   // frame-rate-free lerp
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mq = (q: string) => matchMedia(q).matches;
export const REDUCE = '(prefers-reduced-motion: reduce)', FINE = '(hover: hover) and (pointer: fine)';
type Conn = { connection?: { saveData?: boolean; effectiveType?: string } };
export const lowData = () => { const c = (navigator as Navigator & Conn).connection; return !!c?.saveData || /2g/.test(c?.effectiveType ?? ''); };
```

## 1. Video hero plate, poster-first

**Use it when** footage carries the mood. The base for every video technique below.

```tsx
<section className="plate" ref={ref} data-video="/media/hero">   {/* hero.mp4 + hero-960.mp4 */}
  <picture><source media="(max-width: 768px)" srcSet="/media/hero-poster-960.webp" />
    <img className="plate__poster" src="/media/hero-poster.webp" width={1920} height={1080} alt="" fetchPriority="high" /></picture>
  <div className="plate__film"><video muted playsInline loop preload="none" aria-hidden="true" /></div>
  <div className="plate__content">{/* nav, H1, sub, CTAs: static text */}</div>
</section>
```
```css
.plate{position:relative;min-height:100vh;min-height:100svh;overflow:hidden;isolation:isolate;background:var(--bg);--focal:70% 50%}
[dir='rtl'] .plate{--focal:30% 50%}  @media (max-width:768px){.plate,[dir='rtl'] .plate{--focal:50% 35%}}  /* subject opposite the copy */
.plate__poster,.plate__film,.plate video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--focal)}
.plate__film{opacity:0;transform:scale(1.04);transition:opacity .6s var(--ease-out),transform 1.8s var(--ease-out)}
.plate.is-live .plate__film{opacity:1;transform:none}  .plate__content{position:relative;z-index:10}
```
```ts
export function mountPlate(root: HTMLElement) {
  const v = root.querySelector('video')!;
  if (mq(REDUCE) || lowData()) return () => {};                 // the poster is the design
  let io: IntersectionObserver | undefined;
  const start = () => {
    v.muted = true;           // React's muted prop is missing from prerendered HTML: set the property
    v.src = `${root.dataset.video}${mq('(max-width: 768px)') ? '-960' : ''}.mp4`;
    v.addEventListener('playing', () => root.classList.add('is-live'), { once: true });
    io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); });
    io.observe(root);         // off-screen pauses; a refused autoplay simply leaves the poster
  };
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300));
  if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
  return () => { removeEventListener('load', later); io?.disconnect(); v.pause(); v.removeAttribute('src'); v.load(); };
}
```
```bash
ffmpeg -i src.mp4 -an -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero.mp4     # 8-10 s, <= 4 MB
ffmpeg -i src.mp4 -an -vf "scale=960:-2,fps=24" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero-960.mp4 # <= 1.5 MB
ffmpeg -i public/media/hero.mp4 -frames:v 1 -c:v libwebp -quality 80 public/media/hero-poster.webp   # frame 0, so the swap is invisible
```
- **Preload policy:** `preload="none"`; the hero `src` is set after `load` plus idle, so no
  video byte competes with the poster, CSS or fonts. Below-fold clips get theirs from the
  shared IntersectionObserver at `rootMargin: 200px`. One playing video per viewport. No
  HLS: a self-hosted 6-12 s MP4 with faststart needs no player.
- **LCP and autoplay:** the poster `<img>` is the LCP, preloaded in `index.html` (one
  `rel=preload as=image` per `media` query); unlike the `poster` attribute it takes
  `<picture>`. No `autoplay` attribute; `v.muted = true` before `play()`. Copy stays static
  HTML; phones with busy footage get the plate in-flow under the copy at `aspect-ratio: 4/5`.

## 2. Seamless loop

**Use it when** the clip shows a cut at its loop point. Fix the file: zero runtime cost.

```bash
# natural motion: crossfade the last 1 s into the first (8 s clip), then loop natively
ffmpeg -i in.mp4 -filter_complex "[0]split[a][b];[a]trim=1:8,setpts=PTS-STARTPTS[m];[b]trim=0:1,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=1:offset=6[v]" -map "[v]" -an loop.mp4
# a push-in, bloom or smoke that cannot loop: boomerang (forward, then reversed)
ffmpeg -i in.mp4 -filter_complex "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]" -map "[v]" -an boomerang.mp4
```
Check the seam (first and last frames side by side: `-frames:v 1`, `-sseof -0.1`), then
encode per technique 1. **Playlists** (2-4 clips, <= 3 MB each) cut through the page
colour: `loop = false`; within 0.55 s of the end remove `.is-live` (the film's opacity
transition, set to 0.5 s, dips to the bg); on `ended` set the next `src` and `play()`; on
`playing` add `.is-live` back. MotionSites fades with its own rAF; a CSS opacity
transition on the wrapper runs on the compositor with no subscriber.

## 3. Text over media: eased scrim, progressive blur, grain

**Use it when** copy sits on footage or a photo, or the hero must melt into the next
section. A two-stop gradient bands; an eased one reads as light falloff.

```css
.plate__scrim{position:absolute;inset:0;z-index:1;pointer-events:none;--c:var(--bg);background:linear-gradient(to bottom,
  transparent 55%,color-mix(in srgb,var(--c) 4%,transparent) 62%,color-mix(in srgb,var(--c) 13%,transparent) 69%,
  color-mix(in srgb,var(--c) 28%,transparent) 76%,color-mix(in srgb,var(--c) 48%,transparent) 83%,
  color-mix(in srgb,var(--c) 70%,transparent) 90%,color-mix(in srgb,var(--c) 88%,transparent) 95%,var(--c))}
@media (max-aspect-ratio:11/10){            /* phones: the copy sits over the frame, so protect its side */
  .plate__scrim--side{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(to right,
    color-mix(in srgb,var(--bg) 86%,transparent),color-mix(in srgb,var(--bg) 60%,transparent) 42%,transparent 85%)}}
[dir='rtl'] .plate__scrim--side{transform:scaleX(-1)}
.pblur{position:absolute;inset:auto 0 0;height:45%;z-index:1;pointer-events:none;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  -webkit-mask-image:linear-gradient(to top,#000,transparent);mask-image:linear-gradient(to top,#000,transparent)}
.plate__grain{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:.5;mix-blend-mode:overlay;background-size:200px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E")}
.on-media{text-shadow:0 2px 18px rgb(0 0 0/.42)}  .on-media--display{text-shadow:0 16px 38px rgb(0 0 0/.32)}
```
The scrim ends exactly on `--bg`, so there is no seam into the next section; often the
best scrim is none (copy on the clip's calm zone), never a flat 50% wash. **Progressive
blur only over a still plate:** over video it resamples every frame, and MotionSites' 24px
there loses to perf-playbook.md (~20px cap, small chrome). **Grain is static**; drop it
below 768px if the jank probe regresses. Contrast: the brightest frame in the copy zone.

## 4. Pointer-scrubbed turntable

**Use it when** a product, dish or tool should turn under the cursor like a live 3D
object, without WebGL. MotionSites scrubs a `<video>` with a seek queue; tsx-motion-law.md
bans `currentTime` scrubbing (seeks stall the decoder), so this draws a frame strip.
Markup: `<div className="turn" data-frames="/media/turn/" data-count="36">` holding frame
0 as a sized `<img>` with real alt, then an `aria-hidden` `<canvas>`.

```bash
# a 12 s, 24 fps 360-degree turn (shot on a turntable or generated) -> every 8th frame -> 36 frames
ffmpeg -i turn.mp4 -vf "select='not(mod(n\,8))',scale=1280:-2" -fps_mode vfr -start_number 0 -c:v libwebp -quality 72 public/media/turn/%02d.webp
```
```css
.turn{position:relative;aspect-ratio:4/3;touch-action:pan-y;cursor:ew-resize}  .turn.is-live>canvas{opacity:1}
.turn>img,.turn>canvas{position:absolute;inset:0;width:100%;height:100%}  .turn>canvas{opacity:0;transition:opacity .3s}
```
```ts
export function mountTurntable(root: HTMLElement) {
  const n = Number(root.dataset.count), base = root.dataset.frames!, still = mq(REDUCE);
  const cvs = root.querySelector('canvas')!, ctx = cvs.getContext('2d')!, frames: (HTMLImageElement | undefined)[] = [];
  let target = 0, cur = 0, shown = -1, lastX: number | null = null;
  const load = (i: number) => { const im = new Image(); im.src = `${base}${String(i).padStart(2, '0')}.webp`;
    im.decode().then(() => { frames[i] = im; shown = -1; wake(); }, () => {}); };
  for (let i = 0; i < n; i += 4) load(i);                                              // sparse spine first
  const fill = setTimeout(() => { for (let i = 0; i < n; i++) if (i % 4) load(i); }, 800);   // then backfill
  const nearest = (i: number) => { for (let k = 0; k < n; k++) { const f = frames[(i + k) % n] ?? frames[(i - k + n) % n]; if (f) return f; } };
  const ro = new ResizeObserver(() => { const d = Math.min(devicePixelRatio, 1.5);
    cvs.width = cvs.clientWidth * d; cvs.height = cvs.clientHeight * d; shown = -1; wake(); });
  ro.observe(cvs);
  const off = addTick((_, dt) => {
    cur += (target - cur) * (still ? 1 : follow(0.2, dt));
    const i = ((Math.round(cur) % n) + n) % n, f = nearest(i);
    if (f && i !== shown) { ctx.drawImage(f, 0, 0, cvs.width, cvs.height); shown = i; root.classList.add('is-live'); }
    return Math.abs(target - cur) > 0.01;
  });
  root.addEventListener('pointermove', (e) => {          // mouse: hover scrubs; touch: a horizontal drag (pan-y)
    if (lastX !== null) target += ((e.clientX - lastX) / root.clientWidth) * n * 0.8;
    lastX = e.clientX; wake();
  });
  for (const t of ['pointerleave', 'pointerup', 'pointercancel']) root.addEventListener(t, () => { lastX = null; });
  return () => { off(); ro.disconnect(); clearTimeout(fill); };
}
```
Mount it from the shared IntersectionObserver as the section nears view, so the strip
(36-72 frames, <= 3 MB) never competes with first paint. Relative mapping (0.8 turns per
width) never jumps; frame 0 is crawlable and the reduced-motion state; never mirrored.

## 5. Liquid glass material

**Use it when** UI floats over moving media: nav pill, chips, secondary CTA, stat cards.
The edge is a gradient hairline (bright top and bottom, gone at the sides), not a border.

```css
.glass{position:relative;background:rgb(255 255 255/.02);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
  box-shadow:inset 0 1px 1px rgb(255 255 255/.1)}
.glass::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.4px;pointer-events:none;--a:var(--rim,.45);
  background:linear-gradient(180deg,rgb(255 255 255/var(--a)),rgb(255 255 255/calc(var(--a)/3)) 20%,transparent 40% 60%,
    rgb(255 255 255/calc(var(--a)/3)) 80%,rgb(255 255 255/var(--a)));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.glass--panel{-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);--rim:.5}  .glass--dark{background:rgb(0 0 0/.4);--rim:.3}
.glass--frost{background:rgb(255 255 255/.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}   /* text sits ON it */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.glass{background:rgb(255 255 255/.1)}}
```
Sizes: nav pill padding 6px with 8x12px links at 14px; chips 4x12px at 11px; icon discs
40-48px; cards padding 20-24px, radius 1.25rem; pair with ONE solid primary CTA.
MotionSites' strong tier blurs 50px; capped at 20px here (perf-playbook.md). Over video:
the nav plus <= 3 chips per viewport; panels go over stills. Text ON glass uses `--frost`
and meets 4.5:1 on the brightest frame. On a flat colour glass is a bare hairline.

## 6. Focus-in headline, LCP-safe

**Use it when** a display headline should exhale into focus word by word. MotionSites
fades each word up from opacity 0 through `blur(10px)`, which hides the LCP and animates a
filter. Here the hero H1 paints at first frame (opacity floor .35), moves by transform,
and the blur is a static halo copy whose opacity fades.

```tsx
<h1 className="focus-in">{words.map((w, i) => (
  <Fragment key={i}>{i > 0 && ' '}<span className="rise-w" data-w={w} style={{ '--i': i } as CSSProperties}>{w}</span></Fragment>))}
</h1>
```
```css
.rise-w{position:relative;display:inline-block;animation:rw-in .8s var(--ease-out) calc(.1s + var(--i) * 90ms) both}
.rise-w::after{content:attr(data-w) / "";position:absolute;inset:0;color:transparent;text-shadow:0 0 .14em currentColor;
  animation:rw-halo .8s ease-out calc(.1s + var(--i) * 90ms) both}
@keyframes rw-in{from{opacity:.35;transform:translateY(.35em)}}  @keyframes rw-halo{to{opacity:0}}
/* below the fold the words may start at 0, held until the shared IntersectionObserver adds .is-in */
.focus-in--later .rise-w{animation-name:rw-in-0}  @keyframes rw-in-0{from{opacity:0;transform:translateY(.5em)}}
.js .focus-in--later:not(.is-in) .rise-w,.js .focus-in--later:not(.is-in) .rise-w::after{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.rise-w{animation:none}.rise-w::after{content:none}}
```
Real space text nodes between spans keep `innerText` (and verify.mjs's heading dump)
right; `content: attr() / ""` keeps the halo out of the accessibility tree, and a browser
without that syntax just drops the halo. `.js` comes from an inline script in `index.html`
(no JS, every word shows); the `rise` class feeds verify.mjs's stuck-reveal check. A Latin
phrase inside a Hebrew H1 is ONE span with `dir="ltr"`. 12 words max, landed by 1.5s.

## 7. Spotlight lens

**Use it when** two aligned images hide the point: a wall and its wiring, before and after
a renovation, day and night, sketch and render. MotionSites moves a CSS mask's centre (a
repaint per frame); here a feathered lens moves by transform and the revealed image
counter-moves inside it, so both stay on the compositor. Markup: `.spot` > the sized
`img.spot__base` with real alt, `div.spot__lens[aria-hidden]` > `img.spot__reveal` with
`data-src` (not `src`) and `alt=""`, then a visible `p.spot__hint` saying what is hidden.
```css
.spot{position:relative;overflow:hidden;--r:240px}  .spot__base{display:block;width:100%;height:100%;object-fit:cover}
.spot__lens{position:absolute;left:0;top:0;width:calc(var(--r) * 2);height:calc(var(--r) * 2);border-radius:50%;overflow:hidden;
  opacity:0;transition:opacity .35s var(--ease-out);will-change:transform;--m:radial-gradient(closest-side,#000 40%,rgb(0 0 0/.75) 60%,
  rgb(0 0 0/.4) 75%,rgb(0 0 0/.12) 88%,transparent);-webkit-mask-image:var(--m);mask-image:var(--m)}
.spot.is-lit .spot__lens{opacity:1}  @media (max-width:768px){.spot{--r:150px}}
.spot__reveal{position:absolute;left:0;top:0;width:var(--w);height:var(--h);max-width:none;object-fit:cover;will-change:transform}
```
```ts
export function mountSpot(root: HTMLElement) {
  const lens = root.querySelector<HTMLElement>('.spot__lens')!, img = lens.querySelector('img')!;
  const touch = !mq(FINE), still = mq(REDUCE);
  let w = 0, h = 0, r = 0, tx = 0, ty = 0, x = 0, y = 0, on = false, seen = false;
  const ro = new ResizeObserver(() => {                       // sizes are written on resize only, never per frame
    w = root.clientWidth; h = root.clientHeight; r = lens.offsetWidth / 2; root.style.setProperty('--w', `${w}px`);
    root.style.setProperty('--h', `${h}px`); if (touch) { tx = x = w * 0.5; ty = y = h * 0.55; } wake(); });
  const light = () => { if (!img.src) img.src = img.dataset.src!; root.classList.add('is-lit'); on = true; wake(); };
  const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && touch) light(); wake(); });
  ro.observe(root); io.observe(root);
  const off = addTick((now, dt) => {
    if (touch && !still) { const p = now / 1000;                    // slow deterministic drift on touch
      tx = w * (0.5 + 0.28 * Math.sin(p * 0.45)); ty = h * (0.55 + 0.18 * Math.sin(p * 0.8)); }
    const k = still ? 1 : follow(0.1, dt);
    x += (tx - x) * k; y += (ty - y) * k;
    lens.style.transform = `translate3d(${x - r}px,${y - r}px,0)`;
    img.style.transform = `translate3d(${r - x}px,${r - y}px,0)`;   // counter-move keeps the reveal registered
    return seen && on && ((touch && !still) || Math.abs(tx - x) + Math.abs(ty - y) > 0.2);
  });
  if (!touch) {
    root.addEventListener('pointermove', (e) => { const b = root.getBoundingClientRect();
      tx = e.clientX - b.left; ty = e.clientY - b.top; if (!on) { x = tx; y = ty; } light(); });
    root.addEventListener('pointerleave', () => { root.classList.remove('is-lit'); on = false; });
  }
  return () => { off(); ro.disconnect(); io.disconnect(); };
}
```
The base is the LCP; the reveal (<= 400 KB) loads on first pointer, or on entering view
on touch. Nothing mirrors in RTL. **Assets:** generate the base, then an edit pass of the
same image (wiring exposed, night light), never a second prompt; check alignment with a
50% difference blend.

## 8. Ghost word behind a cut-out

**Use it when** a product, person, dish or tool stands on a flat or saturated field: a
viewport-wide word sits between the backdrop and the subject. Poster depth, no loop.
Markup: `.ghost` > `span.ghost__word[aria-hidden] > span{word}`, the cut-out
`img.ghost__subject` (sized, `fetchPriority="high"`), then `.ghost__ui` holding the real H1.

```css
.ghost{position:relative;min-height:100svh;overflow:hidden;background:var(--stage)}  .ghost__word>span{display:inline-block;white-space:nowrap}
.ghost__word{position:absolute;inset-inline:0;top:18%;z-index:1;text-align:center;pointer-events:none;user-select:none;
  font:400 clamp(90px,28vw,380px)/1 var(--font-mega);letter-spacing:-.02em;color:var(--fg)}
.ghost__subject{position:absolute;inset-inline:0;margin-inline:auto;bottom:0;z-index:2;height:92%;width:auto;object-fit:contain}
.ghost__ui{position:relative;z-index:10}  @media (max-width:640px){.ghost__subject{height:62%;bottom:18%}}
```
```ts
export function fitWord(word: HTMLElement) {          // exact edge-to-edge fit, once per resize, never per frame
  const inner = word.firstElementChild as HTMLElement;
  const fit = () => { word.style.fontSize = '100px';
    word.style.fontSize = `${(100 * word.clientWidth * 0.96) / inner.getBoundingClientRect().width}px`; };
  document.fonts.ready.then(fit);
  const ro = new ResizeObserver(fit); ro.observe(word);
  return () => ro.disconnect();
}
```
The cut-out is the LCP (WebP or AVIF with alpha, <= 400 KB); absolute layers let a font
swap re-fit the word with no CLS. Mega faces: Anton or Bebas Neue (OFL); Hebrew Karantina
or Secular One, one whole word, never split. Cut the subject from a generated image with a
local background remover (rembg, MIT). Optional pointer parallax: word -12px, subject
+18px. Re-test the overlap at 390; `overflow-x: clip` on the root.

## 9. Depth carousel

**Use it when** 3-6 products, packages or colourways each own a colour: one big and
centred, two small at the sides, the rest at the back, and the page colour crossfades.
MotionSites animates `left`, `height`, `bottom` and `filter: blur`; here each role is one
transform plus opacity, and the colour is a stacked layer per item.

```css
.dc{position:relative;height:100svh;overflow:hidden;--d:1;--e:cubic-bezier(.4,0,.2,1)}
[dir='rtl'] .dc{--d:-1}                              /* "next" waits at the inline end */
.dc__bg{position:absolute;inset:0;opacity:0;transition:opacity 650ms var(--e)}  .dc__bg.is-on{opacity:1}
.dc__item{position:absolute;inset-inline:0;margin-inline:auto;bottom:0;height:88%;width:auto;object-fit:contain;
  transform-origin:50% 100%;transition:transform 650ms var(--e),opacity 650ms var(--e);will-change:transform,opacity}
.dc__item[data-role=center]{z-index:3;transform:none}
.dc__item[data-role=next]{z-index:2;opacity:.8;transform:translate3d(calc(22vw * var(--d)),-14%,0) scale(.32)}
.dc__item[data-role=prev]{z-index:2;opacity:.8;transform:translate3d(calc(-22vw * var(--d)),-14%,0) scale(.32)}
.dc__item[data-role=back]{z-index:1;opacity:.55;transform:translate3d(0,-16%,0) scale(.24)}
.dc__name{opacity:.45;transition:opacity .3s}  .dc__name.is-on{opacity:1}  @media (max-width:640px){.dc__item{height:60%;bottom:18%}}
@media (prefers-reduced-motion:reduce){.dc__bg,.dc__item{transition-duration:.01s}}
```
**Logic (no per-frame work):** item `i` takes the role of offset `(i - active + n) % n`: 0
centre, 1 next, `n - 1` prev, else back. `go(+1 | -1)` holds a 650ms lock, rewrites
`data-role`, sets `aria-hidden` on all but the centre and toggles `.is-on` on the matching
colour layer and name. Next is ArrowRight in LTR and ArrowLeft in RTL; a swipe of 40px+
toward the inline start goes next (`e.clientX < x0 !== rtl`).
**Prerender the initial roles** (`data-role` from the index in JSX), or first paint is a
pile of items at the centre; the centre item is the LCP. Every item is a real `<img>`
with alt and every name sits in a visible index list (`aria-live="polite"`), so all
products are crawlable. Preload the rest after load, <= 300 KB each; controls >= 48px.

## 10. Layered scroll story

**Use it when** layered stills tell a story in one pinned viewport: backdrop, title,
subject, foreground halves parting like curtains, a chapter panel. Extends
motion-patterns.md 1 (crossfading acts) with depth planes. Write the windows first:

| Scroll px | What happens |
|---|---|
| 90-650 | title rises -210px, scales to .92, fades; intro copy sinks and fades |
| 560-900 | foreground halves part to +/-46vw; subject grows; backdrop crossfades to its blurred copy; tint to .45 |
| 1300-1620 | subject exits -700px; the chapter panel slides in and out |

Markup: `.st > .st__stage` holding `.st__bg`, `.st__bg--blur`, `.st__tint`, `h2.st__title`,
`.st__subject`, two `.st__fg` (`--l`, `--r`; alt "") and `.st__panel` (real h3 + copy).
```css
.st{position:relative;height:calc(100svh + 1700px)}  .st__stage{position:sticky;top:0;height:100svh;min-height:600px;overflow:hidden}
.st__stage>*{position:absolute;will-change:transform,opacity}  .st__bg{inset:0;width:100%;height:100%;object-fit:cover}
.st__bg--blur,.st__tint{opacity:0}  .st__tint{inset:0;background:color-mix(in srgb,var(--accent) 45%,transparent)}
.st__title,.st__subject,.st__fg,.st__panel{inset-inline:0;margin-inline:auto;max-width:none}   /* centred with no transform */
.st__title{top:19vh;text-align:center}  .st__subject{bottom:5vh;width:min(68vw,1400px)}  .st__panel{top:55%;width:min(760px,90vw)}
.st__fg{bottom:-2vh;width:min(118vw,2240px)}    /* each half is the full width, its other half transparent */
```
```ts
const smooth = (e0: number, e1: number, v: number) => { const x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
const segment = (s: number, a: number, b: number, c: number, d: number) => {
  const enter = smooth(a, b, s), exit = smooth(c, d, s); return { enter, exit, active: enter * (1 - exit) }; };
export function mountStory(sec: HTMLElement) {
  const [title, subj, fgL, fgR, blur, tint, panel] = ['.st__title', '.st__subject', '.st__fg--l', '.st__fg--r',
    '.st__bg--blur', '.st__tint', '.st__panel'].map((c) => sec.querySelector<HTMLElement>(c)!);
  const still = mq(REDUCE);
  let top = 0, span = 1, s = 0;
  const measure = () => { top = sec.getBoundingClientRect().top + scrollY; span = sec.offsetHeight - innerHeight; wake(); };
  measure(); addEventListener('resize', measure); addEventListener('scroll', wake, { passive: true });
  const off = addTick((_, dt) => {
    const target = clamp(scrollY - top, 0, span);                  // cached geometry: no layout read in the tick
    s += (target - s) * (still ? 1 : follow(0.14, dt));
    const intro = smooth(90, 650, s), ch = segment(s, 560, 900, 1300, 1620), part = ch.enter ** 1.5;
    title.style.transform = `translate3d(0,${-210 * intro}px,0) scale(${1 - 0.08 * intro})`; title.style.opacity = `${1 - intro}`;
    for (const [el, side] of [[fgL, -1], [fgR, 1]] as const)      // curtains are physical: never mirrored
      el.style.transform = `translate3d(${side * 46 * part}vw,${-180 * part}px,0) scale(${1 + 0.7 * ch.enter})`;
    subj.style.transform = `translate3d(0,${-700 * ch.exit}px,0) scale(${1 + 0.4 * ch.enter + 0.46 * ch.exit})`;
    blur.style.opacity = tint.style.opacity = panel.style.opacity = `${ch.active}`;   // crossfades, never a filter
    panel.style.transform = `translate3d(0,${58 * (1 - ch.enter) - 86 * ch.exit}px,0)`;
    return Math.abs(target - s) > 0.1;
  });
  return () => { off(); removeEventListener('resize', measure); removeEventListener('scroll', wake); };
}
```
- Windows overlap, so no frame is empty (tsx-motion-law.md handoffs). Sideways narrative
  moves take `* dir`; the curtains do not. All chapter copy is real HTML, opacity-driven.
  No `overflow: hidden` on an ancestor of the sticky stage: use `overflow-x: clip`.
- **Assets:** one generated scene cut into planes with a local background remover, WebP
  alpha at ~2x viewport width, <= 400 KB each; bake the blur (`ffmpeg -i st-bg.webp -vf
  gblur=sigma=14 st-bg-blur.webp`). Phones: runway x0.7. Look at verify's `-mid` frame.

## 11. GLB product hero

**Use it when** the object is the story and a GLB exists (the client's CAD export, or an
image-to-3D generation): a framed product to grab and turn. Built with react-three-fiber
per tsx-motion-law.md; three, `@react-three/fiber` and `@react-three/drei` (all MIT) are
pinned exactly and load as their own chunk, never on the LCP path.

```tsx
// Hero.tsx: the still is in the static HTML; one IntersectionObserver sets near/visible (discrete state)
const Product3D = lazy(() => import('./Product3D'));
<div className="g3d" ref={ref} tabIndex={0} role="group" aria-label="3D view of the kettle. Drag or use the arrow keys to turn it.">
  <img className="g3d__still" src="/media/kettle-render.webp" width={1200} height={1200} alt="The kettle, front three-quarter view" fetchPriority="high" />
  {near && !lowData() && <Suspense fallback={null}><Product3D src="/media/kettle.glb" visible={visible} stage={ref} /></Suspense>}
</div>

// Product3D.tsx
export default function Product3D({ src, visible, stage }: Props) {
  const still = useMemo(() => mq(REDUCE), []);
  const [yaw, setYaw] = useState(0);                   // arrow keys turn 0.26 rad: a discrete event, not a frame
  useEffect(() => { const el = stage.current!; const k = (e: KeyboardEvent) => { const d = e.key === 'ArrowLeft' ? -0.26 : e.key === 'ArrowRight' ? 0.26 : 0;
    if (d) { e.preventDefault(); setYaw((y) => y + d); } }; el.addEventListener('keydown', k); return () => el.removeEventListener('keydown', k); }, [stage]);
  return (
    <Canvas className="g3d__canvas" dpr={[1, 2]} frameloop={visible && !still ? 'always' : 'demand'}
      camera={{ fov: 30, position: [0, 0, 6] }} onCreated={studio}>
      <ambientLight intensity={0.3} /><directionalLight position={[2.5, 3.5, 4]} intensity={1.5} /><hemisphereLight args={['#ffffff', '#3a3a3a', 0.5]} />
      <PresentationControls global={false} cursor speed={1.4} polar={[-0.35, 0.35]}>
        <Float enabled={!still} speed={0.8} rotationIntensity={0.25} floatIntensity={0.15}>
          <Bounds fit clip observe margin={1.1}><group rotation-y={yaw}><Model src={src} stage={stage} /></group></Bounds>
        </Float>
      </PresentationControls>
    </Canvas>
  );
}
function Model({ src, stage }: { src: string; stage: RefObject<HTMLDivElement> }) {
  const { scene } = useGLTF(src, '/draco/');           // self-hosted Draco decoder
  useEffect(() => { stage.current?.classList.add('is-live'); }, [stage]);   // runs once the model has loaded
  return <primitive object={scene} />;
}
const studio = ({ gl, scene }: RootState) => {         // honest product colour, PBR reflections, no HDR download
  gl.toneMapping = THREE.NeutralToneMapping; scene.environment = new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture; };
```
- **The still is the design first:** a render of the GLB at its default angle is the LCP,
  the fallback (no WebGL, Save-Data, an error boundary around `<Product3D>`) and the OG
  image; `.g3d.is-live .g3d__canvas` fades in over it. `touch-action: pan-y` on the stage.
- **Free light and decoder:** this skill's 3-point rig plus `RoomEnvironment`, because
  glossy PBR renders near-black without reflections; never drei's `<Environment preset>`
  (it fetches HDRs from a CDN). Copy `node_modules/three/examples/jsm/libs/draco/gltf/` to
  `public/draco/` (MotionSites pulls the decoder from a Google CDN).
- **Hand-rolled instead of drei:** re-centre on the bounding sphere, scale to radius 1,
  camera distance `H / (0.9 * min(W, H) * tan(fov / 2))`; drag 0.006 rad/px through
  premultiplied quaternions; inertia `exp(-3.5 * dt)`, max 12 rad/s, killed by a 90ms pause.
- **Budget:** GLB <= 3-5 MB after `npx @gltf-transform/cli optimize in.glb out.glb
  --compress draco --texture-compress webp` (MIT); DPR <= 2. Never with technique 10.

## Deliberately left out of the source library

Already covered here: split text, scroll-lit words, count-ups, marquees, scramble,
typewriter, rotating words, pointer parallax, orbit rings. Not ported: the fluted-glass
shader backdrop (a fill-rate-bound full-screen shader for a background), the sand
dissolve (SVG turbulence on bitmaps), the cursor image trail, the multi-video switcher
(3-5 clips of payload; 7 does "discover" with two stills), scroll-scrubbed video
(tsx-motion-law.md's canvas sequence owns it), sticky stacking cards (10's helpers).
