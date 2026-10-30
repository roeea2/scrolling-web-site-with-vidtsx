# The Kitchen - tactile components to rebuild in a site

[The Kitchen](https://www.dqnamo.com/kitchen) is dqnamo's collection of
interaction studies: physical, crafted components (a pushable button, a
perforated ticket, a postage stamp, a receipt that prints, a holographic foil)
built with a designer's eye for depth, timing and restraint. Magic UI gives a
site light and energy. The Kitchen gives it **material**: paper, hardware, ink.
Use it when a brand should feel made by hand, collectible or physical.

Every recipe below runs live in [`kitchen-demo.html`](kitchen-demo.html). Open
it in a browser to show a client the effects during the interview, and to check
that a recipe still works before porting it. The recipes are this skill's own
code, rebuilt from the techniques. No Kitchen source is copied here.

## Source and license (read before using their code)

- **Demos:** `https://www.dqnamo.com/experiments/<slug>`. Each page shows the full
  source with a **Copy** button, and some add "Copy prompt for coding agent".
  The author publishes these to be reused.
- **Source:** [github.com/dqnamo/website](https://github.com/dqnamo/website), mainly
  in `components/<Name>.tsx`. To fetch a component:
  `gh api repos/dqnamo/website/contents/components/Stamp.tsx --jq .content | base64 -d`.
  Stack: React 19, Tailwind v4 with Radix color tokens (`grayscale-12`, `red-9`),
  `motion`, `@phosphor-icons/react`, `react-parallax-tilt`.
- **License: none.** As of 2026-10-30 the repo has no LICENSE file. The
  `"license": "ISC"` in its package.json is npm's default on a private package,
  not a grant. So:
  1. **Default to the recipes in this file.** They are clean-room and need no
     permission.
  2. Adapting their copied source inside one site build matches the author's
     evident intent (the Copy buttons). If you do, credit it in a comment:
     `/* after dqnamo's Kitchen: dqnamo.com/experiments/<slug> */`.
  3. **Never** put their source in a public repo, a template, a component
     library or this skill.
  4. Before shipping copied code on a paid client site, re-check the repo for a
     LICENSE. If there is still none, use the recipe here or ask the author via
     the contact link on dqnamo.com.

## Catalog

All 15 Kitchen experiments as of 2026-10-30. "Port" says how much code the vanilla
version takes.

| Experiment (slug) | What it is | Use it on a site for | Port |
|---|---|---|---|
| Tactile Button (`tactile-button`) | A face that presses down into a visible edge | **Primary CTAs** with weight: "Book", "Call", "Order" | CSS only |
| Scramble Text (`scramble-text`) | Changed text resolves through cipher glyphs | Security/tech headlines, codes, counters, "access granted" | ~25 lines JS |
| Receipt Printer (`receipt-printer`) | A receipt feeds out of a slot when payment clears | Order, booking or quote **confirmation** states | CSS + ~12 lines JS |
| Cassette Audio Player (`cassette-player`) | Reels turn with the audio, tape packs shift | Podcasts, radio, music, sound studios | CSS + ~12 lines JS |
| Hold to Confirm (`hold-to-confirm`) | Fills while held, then offers a timed undo | Destructive or binding actions: cancel booking, delete | ~45 lines JS |
| Magnetic Drop Zone (`magnetic-drop-zone`) | Upload target leans toward an incoming file drag | "Send a photo for a quote", CV upload, plan upload | ~25 lines JS |
| Dynamic Button (`dynamic-button`) | Resizes smoothly as its label changes | Form submit states: Send, Sending, Sent | ~20 lines JS |
| Playing Cards (`playing-cards`) | Composable card, plus a fanned hand you thumb through | **Portfolio or project fans**, menus, team cards | CSS only (`:has()`) |
| Ticket (`ticket`) | Perforated ticket with a stub and parallax tilt | Events, venues, travel, cinemas, RSVP, pricing tiers | CSS + optional tilt |
| Stamp (`stamp`) | Perforated postage-stamp frame for any content | Bakeries, post/craft brands, "since 1998" badges, galleries | CSS only |
| Scroll Fade List (`scroll-fade-list`) | A list whose edges fade only while there is more to scroll | Service areas, menus, FAQs in a card, testimonials | ~12 lines JS |
| Advanced Model Selector (`model-selector`) | Benchmark-informed AI model picker | AI products only. App UI, rarely a marketing site | React, not ported |
| Animated Signature (`signature`) | An SVG signature that draws itself | Founder letters, "about us", guarantees, closing a page | CSS only |
| Logo Trace Loader (`logo-trace-loader`) | A dash runs the logo outline, closes, then fills | Form submit / app loading **after** first paint, brand sting | CSS + ~10 lines JS |
| Iridescent Foil (`iridescent-foil`) | Holographic foil that shifts with scroll and pointer | Membership cards, collectibles, premium tiers, launch badges | CSS + ~20 lines JS |

## Pairing by brand mood

These have a voice. Pick **2-4 from one material world** per site:

- **Paper** (ticket, stamp, receipt, signature): events, bakeries, cafes, craft
  shops, studios, anything with a "since" date.
- **Hardware** (tactile button, cassette, card fan, dynamic button): trades,
  audio, gadgets, makers, playful SaaS.
- **Light** (iridescent foil, scramble text, logo trace): luxury, fintech,
  security, launches, memberships.

They mix well with Magic UI as long as the world holds. A paper ticket plus a
flickering LED grid reads as two different sites. A tactile CTA on a trade site
next to border beams as current is one story. For a trade site, use a tactile
"Call now", a magnetic drop zone for "send a photo of your panel", a receipt
printer for the quote confirmation, and a scroll fade list of service areas.

## Recipes (vanilla, tested in kitchen-demo.html)

Shared setup used below:
```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
```

### Tactile button
Two layers: the edge sits `--depth` lower, and the face translates down onto it.
Works on `<a>` and `<button>`.
```css
.tactile { --depth: 6px; --r: 12px; --face: #4a4a46; --face-hi: #66655f; --edge: #292926; --label: #eee;
  position: relative; display: inline-grid; padding: 0 0 var(--depth); border: 0; background: none;
  font: inherit; text-decoration: none; cursor: pointer; user-select: none; }
.tactile::before { content: ""; position: absolute; inset: var(--depth) 0 0; border-radius: var(--r);
  background: var(--edge); box-shadow: inset 0 -1px 0 rgb(0 0 0 / .45); }
.tactile > span { position: relative; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: var(--r); background: var(--face); color: var(--label); font-weight: 600;
  box-shadow: inset 0 1px 0 var(--face-hi); transition: translate .15s cubic-bezier(.23, 1, .32, 1); }
@media (hover: hover) and (pointer: fine) { .tactile:hover > span { translate: 0 2px; } }
.tactile:active > span { translate: 0 var(--depth); }
.tactile:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: var(--r); }
```
```html
<a class="tactile" href="tel:+972..."><span>Call now</span></a>
```
Brand it by setting `--face`, `--face-hi` (a lighter top highlight) and `--edge`
(a darker shade of the face).

### Scramble text
**SEO law:** the real text is always in the HTML. The scramble is an
`aria-hidden` layer stacked over it in one grid cell, and the real text only
turns transparent while the effect runs. Width and height are locked to the real
text, so there is zero CLS, and crawlers and screen readers always read the
words.
```css
.scr { display: inline-grid; }
.scr > span { grid-area: 1 / 1; }
.scr-fx { width: 0; min-width: 100%; height: 0; min-height: 100%; overflow: clip; white-space: nowrap; }
.scr.is-scrambling .scr-real { color: transparent; }
```
```js
const GLYPHS = "-_~!@#$%^&*+=[]{}|;:<>?/";
const graphemes = (s) => "Segmenter" in Intl   // keeps Hebrew niqqud and emoji intact
  ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)].map((g) => g.segment) : [...s];
function scramble(el, text = el.dataset.text ?? el.textContent.trim(), ms = 32) {
  el.dataset.text = text;
  let real = el.querySelector(".scr-real"), fx = el.querySelector(".scr-fx");
  if (!real) {
    el.textContent = "";
    real = el.appendChild(document.createElement("span")); real.className = "scr-real";
    fx = el.appendChild(document.createElement("span")); fx.className = "scr-fx"; fx.setAttribute("aria-hidden", "true");
  }
  real.textContent = text;
  clearInterval(el._scr);
  if (reduce.matches) { fx.textContent = ""; el.classList.remove("is-scrambling"); return; }
  const parts = graphemes(text), step = Math.max(1, Math.ceil(parts.length / 48));
  let shown = 0;
  el.classList.add("is-scrambling");
  const tick = () => {
    fx.textContent = parts.map((c, i) => (i < shown || !c.trim() ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
    if (shown >= parts.length) { clearInterval(el._scr); el.classList.remove("is-scrambling"); fx.textContent = ""; }
    shown += step;
  };
  tick(); el._scr = setInterval(tick, ms);
}
// run once in view; call scramble(el, "new text") whenever the text changes
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); } }));
document.querySelectorAll("[data-scramble]").forEach((el) => io.observe(el));
```
Proportional fonts are fine because the box is locked. A monospace face reads more
"cipher". The glyphs are random here because the effect is live UI. In a
rendered video, seed them (see `opus-videos.md`).

### Animated signature
`pathLength="1"` normalizes the path. The dash period is **longer than the path**
(`1 2`), and the start offset sits just inside the gap (`1.01`). With `1 1` and a
round linecap, a dot shows at the start.
```css
.sig path { fill: none; stroke: currentColor; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 1 2; stroke-dashoffset: 1.01; }
.sig.is-in path { animation: sig-draw 2.6s cubic-bezier(.2, .2, .8, .9) forwards; }
@keyframes sig-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .sig path { stroke-dashoffset: 0; animation: none !important; } }
```
```html
<svg class="sig" viewBox="0 0 320 110" role="img" aria-label="Signed, Dana Levi"><path pathLength="1" d="M14 86 C40 30 ..."/></svg>
```
Add `.is-in` with an IntersectionObserver at `threshold: .6`. For a
multi-stroke signature, give each path an `animation-delay`, and split the total
duration in proportion to each path's `getTotalLength()`.

**Getting a real signature:** it must be a **centerline** stroke. A traced
outline from an image (potrace) draws as a double line. Have the person sign
once on a phone or tablet with pointer events capturing points. Smooth the
points with quadratic midpoints (`Q p[i] mid(p[i], p[i+1])`) into one `d`.

### Logo trace loader
A dash `.16` long laps the outline. When the work finishes, wait for the **next
lap boundary** (`animationiteration`), grow the dash to the full outline, then
fill. Waiting for the boundary means the close always starts from the same point.
```css
.trace path { fill: none; stroke: currentColor; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
.trace .trace-guide { opacity: .18; stroke-width: 2.5; }
.trace .trace-run { fill: currentColor; fill-opacity: 0; stroke-dasharray: .16 .84;
  animation: trace-loop .7s linear infinite; transition: fill-opacity .2s ease-out; }
@keyframes trace-loop { to { stroke-dashoffset: -1; } }
.trace.is-closing .trace-run { animation: trace-close .5s linear forwards; }
@keyframes trace-close { from { stroke-dasharray: .16 .84; } to { stroke-dasharray: 1 0; } }
.trace.is-done .trace-run { fill-opacity: 1; }
```
```js
function finishTrace(svg) {   // <svg class="trace" role="status" aria-label="Loading">: guide path + run path (pathLength="1")
  const run = svg.querySelector(".trace-run");
  const done = () => { clearTimeout(fallback); svg.classList.add("is-closing", "is-done"); svg.setAttribute("aria-label", "Loaded"); };
  const fallback = setTimeout(done, 1600);   // hidden tabs may never fire animation events
  if (reduce.matches) return done();
  run.addEventListener("animationiteration", () => {
    svg.classList.add("is-closing");
    run.addEventListener("animationend", done, { once: true });
  }, { once: true });
}
```
**Never as a gate in front of content.** A preloader that hides the page kills LCP.
Use it for real async work (a form submit, an app view loading) or as a brand
sting after the page is already interactive.

### Iridescent foil
The layers, bottom to top:
1. A silver base (the element's own background).
2. A wide rainbow band (`::before`), whose `background-position` follows `--shift`.
3. The content.
4. A glare and a specular streak (`::after`, `screen` blend).

One rAF writes the variables from scroll and pointer.
```css
.foil { --shift: 0%; --mx: 50%; --my: 50%; --angle: 120deg; position: relative; isolation: isolate; overflow: hidden;
  contain: paint; border-radius: 16px; background: linear-gradient(135deg, #efefef, #d9d9d9 42%, #c9c9cb 70%, #ebebeb); }
.foil::before, .foil::after { content: ""; position: absolute; inset: 0; pointer-events: none; }
.foil::before { z-index: -1; filter: saturate(1.3); background-size: 320% 100%; background-position: var(--shift) 50%;
  background-image: linear-gradient(110deg, transparent 22%, rgb(0 214 255 / .34) 30%, rgb(110 255 190 / .3) 37%,
    rgb(255 236 96 / .26) 44%, rgb(255 84 182 / .32) 52%, rgb(146 100 255 / .34) 60%, rgb(60 128 255 / .26) 66%, transparent 74%); }
.foil::after { mix-blend-mode: screen; background-size: 100% 100%, 220% 100%; background-position: 0 0, var(--shift) 50%;
  background-image: radial-gradient(circle at var(--mx) var(--my), rgb(255 255 255 / .55), rgb(255 255 255 / .12) 18%, transparent 42%),
    linear-gradient(var(--angle), transparent 30%, rgb(255 255 255 / .35) 45%, transparent 58%); }
```
```js
const foils = [...document.querySelectorAll("[data-foil]")];
let raf = 0, hot = null, px = .5, py = .5;
function paint() {
  raf = 0;
  for (const el of foils) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const s = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));  // 0..1 through the viewport
    const x = el === hot ? px : .5, y = el === hot ? py : .5;
    el.style.setProperty("--shift", `${(s * .8 + (x - .5) * .2) * 100}%`);
    el.style.setProperty("--angle", `${100 + s * 80 + (x - .5) * 30}deg`);
    el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`);
  }
}
const schedule = () => { raf ||= requestAnimationFrame(paint); };
if (!reduce.matches) {
  addEventListener("scroll", schedule, { passive: true }); addEventListener("resize", schedule);
  if (fine.matches) for (const el of foils) {
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect();
      hot = el; px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height; schedule(); });
    el.addEventListener("pointerleave", () => { hot = null; schedule(); });
  }
}
schedule();
```
On a site that already runs a rAF engine, call `paint()` from that loop instead.
Text on foil needs dark ink and a large size, because the glare passes over it.

### Ticket
Round notches come from a two-layer **mask**: each half of the element gets one
radial bite at the tear line. The shadow lives on a **parent** with
`filter: drop-shadow()`, because `box-shadow` on a masked element is masked away.
```css
.ticket-wrap { filter: drop-shadow(0 1px 1px rgb(15 15 15 / .1)) drop-shadow(0 18px 26px rgb(15 15 15 / .13)); }
.ticket { --notch: 12px; --stub: 27%; --tear: calc(100% - var(--stub));
  display: grid; grid-template-rows: 1fr var(--stub); aspect-ratio: 5 / 9.5; border-radius: 14px; background: var(--accent);
  mask: radial-gradient(circle var(--notch) at 0 var(--tear), #0000 98%, #000) left / 51% 100% no-repeat,
        radial-gradient(circle var(--notch) at 100% var(--tear), #0000 98%, #000) right / 51% 100% no-repeat; }
.ticket-body { position: relative; }
.ticket-body::after { content: ""; position: absolute; inset-inline: calc(var(--notch) + 6px); bottom: 0;
  border-bottom: 1.5px dashed currentColor; opacity: .35; }   /* the tear line */
```
Halftone texture: `background: radial-gradient(circle, currentColor 1.6px, transparent 2.1px) 0 0 / 10px 10px`
masked by `radial-gradient(closest-side, #000 30%, #0000)`.

**Tilt (hover devices only):**
```js
if (fine.matches && !reduce.matches) for (const el of document.querySelectorAll("[data-tilt]")) {
  el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(1100px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale(1.02)`; });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
}   /* plus: [data-tilt] { transition: transform .22s cubic-bezier(.23, 1, .32, 1); } */
```
Give the ticket an `aria-label` that reads the whole thing ("Ticket: Night Shift,
14 November, 21:00"). If it is a real ticket, its data must be real.

### Stamp
The perforated edge is pure CSS:
- A tiled circle mask punches holes centered on the edges. The `round` repeat
  fits a whole number of holes per side.
- A second, inset rectangle layer fills the interior back in.
```css
.stamp-wrap { filter: drop-shadow(0 1px 1px rgb(15 15 15 / .12)) drop-shadow(0 12px 22px rgb(15 15 15 / .09)); }
.stamp { --r: 5px; aspect-ratio: 4 / 5; padding: calc(var(--r) * 2.6); background: #fff;
  mask: radial-gradient(var(--r), #0000 98%, #000) round calc(var(--r) * -1.5) calc(var(--r) * -1.5) / calc(var(--r) * 3) calc(var(--r) * 3),
        linear-gradient(#000 0 0) no-repeat 50% / calc(100% - var(--r) * 3) calc(100% - var(--r) * 3); }
```
Put any image or element inside, then rotate a group of stamps a few degrees each for a collage.

### Scroll fade list
The fades grow with how much is left to scroll, so they vanish at each end. A
**mask** (not a colored overlay) means the fade works over any background,
including images.
```css
.fade-list { --top: 0px; --bottom: 0px; height: 220px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;
  mask: linear-gradient(#0000, #000 var(--top), #000 calc(100% - var(--bottom)), #0000); }
```
```js
for (const el of document.querySelectorAll("[data-fade-list]")) {   // give it tabindex="0" + aria-label: it scrolls
  const MAX = 56; let raf = 0;
  const update = () => { raf = 0; const rest = el.scrollHeight - el.clientHeight - el.scrollTop;
    el.style.setProperty("--top", `${Math.min(MAX, el.scrollTop)}px`);
    el.style.setProperty("--bottom", `${Math.min(MAX, Math.max(0, rest))}px`); };
  el.addEventListener("scroll", () => { raf ||= requestAnimationFrame(update); }, { passive: true });
  new ResizeObserver(update).observe(el);
}
```

### Dynamic button
The button measures the next label in a hidden ghost, freezes its current width,
then transitions to the new width while the old label exits up and the new one
rises in. Both labels share one grid cell, so they cross over in place.
```css
.dyn { position: relative; box-sizing: border-box; display: inline-flex; justify-content: center; align-items: center;
  overflow: hidden; white-space: nowrap; transition: width .26s cubic-bezier(.23, 1, .32, 1), scale .15s; }
.dyn:active { scale: .97; }
.dyn-stack { display: inline-grid; justify-items: center; }
.dyn-stack > * { grid-area: 1 / 1; }
.dyn-ghost { position: absolute; visibility: hidden; white-space: nowrap; }
.dyn-in { animation: dyn-in .18s cubic-bezier(.23, 1, .32, 1) both; }
.dyn-out { animation: dyn-out .18s cubic-bezier(.23, 1, .32, 1) both; }
@keyframes dyn-in { from { opacity: 0; translate: 0 8px; } }
@keyframes dyn-out { to { opacity: 0; translate: 0 -8px; } }
```
```html
<button class="dyn" type="submit"><span class="dyn-stack"><span>Send</span></span><span class="dyn-ghost" aria-hidden="true"></span></button>
```
```js
function setButtonLabel(btn, text) {
  const stack = btn.querySelector(".dyn-stack"), ghost = btn.querySelector(".dyn-ghost");
  const current = stack.lastElementChild;
  if (current.textContent === text) return;
  const cs = getComputedStyle(btn);
  ghost.textContent = text;
  const to = Math.ceil(ghost.offsetWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth));
  btn.style.width = `${btn.offsetWidth}px`;
  btn.offsetWidth;                       // commit the start width before transitioning
  btn.style.width = `${to}px`;
  current.className = "dyn-out"; current.setAttribute("aria-hidden", "true");
  if (reduce.matches) current.remove();  // no animationend fires without animation
  else current.addEventListener("animationend", () => current.remove(), { once: true });
  stack.append(Object.assign(document.createElement("span"), { textContent: text, className: "dyn-in" }));
}
```
`interpolate-size: allow-keywords` does not replace the measurement: the width stays
`auto` before and after, so nothing transitions.

### Hold to confirm, then undo
A filled copy of the label is clipped to zero and opens over the hold duration.
Releasing early snaps it back in 180ms. It uses pointer capture, cancels if the
finger drifts more than 8px outside, holds with Enter or Space for keyboards, and
blocks the touch long-press menu.
```css
.hold { --hold: 1600ms; position: relative; isolation: isolate; overflow: hidden; touch-action: none;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.hold-fill { position: absolute; inset: 0; display: grid; place-items: center; background: var(--danger); color: #fff;
  clip-path: inset(0 100% 0 0); transition: clip-path .18s cubic-bezier(.23, 1, .32, 1); }
[dir="rtl"] .hold-fill { clip-path: inset(0 0 0 100%); }   /* fill from the inline start */
.hold.is-holding .hold-fill { clip-path: inset(0); transition: clip-path var(--hold) linear; }
.hold.is-done .hold-fill { clip-path: inset(0); transition: none; }
```
```html
<button class="hold" type="button"><span>Hold to cancel booking</span><span class="hold-fill" aria-hidden="true">Hold to cancel booking</span></button>
```
```js
function holdToConfirm(btn, onConfirm, resetAfter = 1800) {
  const ms = parseFloat(getComputedStyle(btn).getPropertyValue("--hold")) || 1600;
  let timer = 0, pointerId = null;
  const start = () => { if (timer || btn.classList.contains("is-done")) return;
    btn.classList.add("is-holding"); btn.setAttribute("aria-busy", "true"); timer = setTimeout(done, ms); };
  const cancel = () => { if (!timer) return; clearTimeout(timer); timer = 0; pointerId = null;
    btn.classList.remove("is-holding"); btn.removeAttribute("aria-busy"); };
  const done = () => { timer = 0; pointerId = null; btn.classList.replace("is-holding", "is-done");
    btn.removeAttribute("aria-busy"); onConfirm(); setTimeout(() => btn.classList.remove("is-done"), resetAfter); };
  btn.addEventListener("pointerdown", (e) => { if (!e.isPrimary || e.button !== 0) return;
    pointerId = e.pointerId; btn.setPointerCapture(pointerId); start(); });
  btn.addEventListener("pointermove", (e) => { if (e.pointerId !== pointerId) return;
    const r = btn.getBoundingClientRect(), pad = 8;
    if (e.clientX < r.left - pad || e.clientX > r.right + pad || e.clientY < r.top - pad || e.clientY > r.bottom + pad) cancel(); });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture", "blur"]) btn.addEventListener(type, cancel);
  btn.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); } });
  btn.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cancel(); } });
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
}
```
**Undo:** show a `role="status"` row with the message and an Undo button. A
2px bar drains under the button (`transform: scaleX(1 -> 0)` over 5s), and
the action commits only when the timer expires. `showUndo()` in the demo is the
full version.

The fill is a progress indicator (essential motion), so it keeps running under
reduced motion. **Never put a hold on the primary CTA:** the friction that
protects a destructive action kills a conversion.

### Receipt printer
- The paper hangs in an `overflow: hidden` clip under a dark slot.
- It feeds out with a **stepped** animation: a hold while each line prints,
  then a jerk.
- A conic-gradient mask cuts the zigzag tear edge.
- The shadow goes on the clip parent (the same mask rule as the ticket).
```css
.printer-slot { position: relative; z-index: 1; height: 14px; border-radius: 7px; background: #1d1d1b;
  box-shadow: inset 0 3px 4px rgb(0 0 0 / .6); }
.receipt-clip { overflow: hidden; margin: -7px 12px 0; padding: 0 8px 24px;
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / .1)) drop-shadow(0 8px 12px rgb(0 0 0 / .12)); }
.receipt { --tooth: 14px; padding: 20px 16px 26px; background: #fffdf8; transform: translateY(-101%);
  font: 12px/1.55 ui-monospace, monospace;
  mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / var(--tooth) 100%; }
```
```js
function printReceipt(paper, lines = 8, ms = 1800) {   // returns a promise: await it, then announce
  paper.getAnimations().forEach((a) => a.cancel());
  if (reduce.matches) { paper.style.transform = "translateY(0)"; return Promise.resolve(); }
  const frames = [];
  for (let i = 0; i <= lines; i++) {
    const y = { transform: `translateY(${-101 + (101 * i) / lines}%)` };
    frames.push(y);
    if (i < lines) frames.push(y);                       // hold while the line prints
  }
  return paper.animate(frames, { duration: ms, easing: "linear", fill: "forwards" }).finished;
}
```
Keep the receipt `aria-hidden` until it lands, and announce the state through a
`role="status"` line ("Payment received, printing receipt", then "Receipt
printed"). Only print real order data.

### Magnetic drop zone
A window-level `dragover` measures the pointer's distance from the zone's
**edge**. Within 180px, the zone leans up to 10px toward the file. Inside, it
stops leaning and scales up. A spring transition does the smoothing, so no rAF
is needed. The zone is a real `<label>` around an `<input type="file">`, so click
and keyboard work.
```css
.magnet { translate: var(--mx, 0px) var(--my, 0px);
  transition: translate .3s cubic-bezier(.34, 1.56, .64, 1), scale .3s cubic-bezier(.34, 1.56, .64, 1), border-color .2s, background-color .2s; }
.magnet[data-state="near"] { scale: 1.01; border-color: #8fb0ff; }
.magnet[data-state="over"] { scale: 1.025; border-color: #3b6cff; }
.magnet:focus-within { outline: 2px solid #3b6cff; outline-offset: 3px; }
```
```js
const zone = document.querySelector("[data-magnet]"), RANGE = 180, PULL = 10;
const isFileDrag = (e) => [...(e.dataTransfer?.types ?? [])].includes("Files");
const reset = () => { zone.style.setProperty("--mx", "0px"); zone.style.setProperty("--my", "0px"); zone.dataset.state = ""; };
addEventListener("dragover", (e) => {
  if (!isFileDrag(e)) return;
  const r = zone.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const gap = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
  const near = Math.max(0, 1 - gap / RANGE), over = gap === 0;
  const pull = over || reduce.matches ? 0 : near * PULL, d = Math.max(1, Math.hypot(dx, dy));
  zone.style.setProperty("--mx", `${(dx / d) * pull}px`); zone.style.setProperty("--my", `${(dy / d) * pull}px`);
  zone.dataset.state = over ? "over" : near > 0 ? "near" : "";
});
addEventListener("drop", reset); addEventListener("dragend", reset);
document.addEventListener("dragleave", (e) => { if (!e.relatedTarget) reset(); });
zone.addEventListener("dragover", (e) => { if (isFileDrag(e)) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } });
zone.addEventListener("drop", (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
```
Change the copy with the state ("Drop a photo" / "Bring it closer" / "Let go to
add it"). Validate type and size, and show the error in text, not only in color.

### Card fan (playing cards)
Pure CSS:
- Each card gets its offset from the center as `--o`, plus `--a = |o|`, written
  inline by the template.
- Rotation and droop are derived from those two values.
- Hover and focus lift a card. `:has()` pushes its neighbors aside.
```css
.fan { --step: 7deg; --spread: clamp(22px, 6.5vw, 34px); --drop: 10px; --dir: 1;
  display: grid; place-items: end center; height: 230px; padding: 0 0 26px; list-style: none; }
[dir="rtl"] .fan { --dir: -1; }
.fan > li { grid-area: 1 / 1; width: 100px; aspect-ratio: 5 / 7; transform-origin: 50% 100%;
  translate: calc(var(--o) * var(--dir) * var(--spread) + var(--push, 0px)) calc(var(--a) * var(--drop));
  rotate: calc(var(--o) * var(--dir) * var(--step));
  transition: translate .35s cubic-bezier(.34, 1.56, .64, 1), rotate .35s cubic-bezier(.34, 1.56, .64, 1), scale .25s; }
.fan > li:is(:hover, :focus-within) { z-index: 10; scale: 1.04;
  translate: calc(var(--o) * var(--dir) * var(--spread)) -36px; rotate: calc(var(--o) * var(--dir) * var(--step) * .3); }
.fan > li:is(:hover, :focus-within) + li { --push: calc(22px * var(--dir)); }
.fan > li:is(:hover, :focus-within) + li + li { --push: calc(11px * var(--dir)); }
.fan > li:has(+ li:is(:hover, :focus-within)) { --push: calc(-22px * var(--dir)); }
.fan > li:has(+ li + li:is(:hover, :focus-within)) { --push: calc(-11px * var(--dir)); }
```
```html
<ul class="fan" aria-label="Projects"><li style="--o:-2; --a:2"><a href="/work/kitchen">...</a></li> ...</ul>
```
Each card is a real link. Size `--spread` with `clamp()` so the outer cards clear
a phone's width, and check that in the verify sweep. The Kitchen's drag-to-play
pile is app behavior, so leave it out of marketing sites.

### Cassette reels
The reels and tape packs read from the media clock, not their own timers, so a
seek or a pause is always in sync. The variables are written from one rAF that
runs only while the media plays.
```css
.reel { rotate: var(--spin); background: repeating-conic-gradient(#e9e4d8 0 18deg, #b9b3a6 18deg 60deg);
  border-radius: 50%; mask: radial-gradient(circle, #0000 22%, #000 24%); }
.pack { border-radius: 50%; background: repeating-radial-gradient(circle, #060606 0 2px, #191919 2px 4px); }
.pack-l { scale: calc(1 - var(--p) * .4); }  .pack-r { scale: calc(.6 + var(--p) * .4); }
```
```js
function bindDeck(deck, audio) {   // audio: the real <audio controls> element, kept visible
  let raf = 0;
  const sync = () => {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    if (!reduce.matches) deck.style.setProperty("--spin", `${(audio.currentTime * 300) % 360}deg`);
    deck.style.setProperty("--p", p.toFixed(4));
    raf = audio.paused ? 0 : requestAnimationFrame(sync);
  };
  audio.addEventListener("play", () => { raf ||= requestAnimationFrame(sync); });
  audio.addEventListener("seeked", sync); audio.addEventListener("loadedmetadata", sync);
}
```
Mark the cassette art `aria-hidden` and keep the native controls (or a fully
labelled custom transport) as the accessible player.

## Laws

1. **Real words in static HTML.** Scrambles, dynamic labels and printed receipts
   decorate text that is already in the markup. They never generate it.
2. **Pointer effects are for pointers.** Tilt, glare and hover lifts sit behind
   `(hover: hover) and (pointer: fine)`. Touch gets the static or scroll-driven
   version, and focus gets the same lift as hover.
3. **Masked or clipped shapes take their shadow from a parent.** On a masked
   element, `filter: drop-shadow()` and `box-shadow` are masked away, so put the
   filter on a wrapper.
4. **One rAF and CSS variables.** Foil, fade lists and reels write variables from
   a single scheduled frame, or join the site's existing loop. They never set
   React state per frame, the same law as `tsx-motion-law.md`.
5. **Loaders never gate LCP.** The logo trace runs over real async work or after
   first paint.
6. **Reduced motion** jumps to the final state: the signature drawn, the receipt
   printed, the label swapped, the reels still. Progress fills that carry meaning
   (hold to confirm) keep running.
7. **RTL:** fills grow from the inline start, the fan mirrors through `--dir`,
   scramble segments by grapheme (niqqud stays attached), and tear lines use
   `inset-inline`.
8. **Restraint.** 2-4 Kitchen pieces per site, from one material world. Each one
   should be the best version of an element the site needs anyway (its CTA, its
   upload, its confirmation), never a toy added for its own sake.
