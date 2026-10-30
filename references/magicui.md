# Magic UI - modern components to port into a build

[Magic UI](https://magicui.design) ([github.com/magicuidesign/magicui](https://github.com/magicuidesign/magicui),
MIT) is a library of 75+ animated React components: light beams on borders,
flickering grids, animated gradients, text effects, device mockups, globes,
marquees. It is the fastest way to make a site feel modern and expensive, and
it pairs naturally with this skill's motion law. Use it as a **vocabulary**:
pick the few components that carry the brand's story, then port or install
them deliberately.

Proven in production on an electrical contractor's landing page (2026-10): 10 Magic UI
techniques ported to vanilla CSS/TS. That page scored Lighthouse 100 in
performance, accessibility, best practices and SEO, on mobile and desktop.

## Getting the source

Every component is a single `.tsx` file. Two endpoints, both public:

```bash
# registry JSON: source + npm dependencies + registry dependencies
curl -s https://magicui.design/r/border-beam.json | jq -r '.files[0].content'
curl -s https://magicui.design/r/border-beam.json | jq '.dependencies'

# raw source
curl -s https://raw.githubusercontent.com/magicuidesign/magicui/main/apps/www/registry/magicui/border-beam.tsx
```

The full index, with official descriptions, is the repo root `registry.json`
(`items[]` where `type == "registry:ui"`). Read the source before using a
component. The descriptions undersell what is reusable.

## Install or port? Decide once per project

The components are written for **Tailwind v4 + a `cn()` helper + `motion/react`**.
This skill's builds use plain CSS custom properties. So:

| Situation | Approach |
|---|---|
| **SEO-critical page**: landing pages, local-business pages, anything that must rank | **Port the technique to vanilla CSS/TS.** Content stays in static HTML; no React, no hydration. The visual is identical, and most effects become 20-60 lines of CSS. |
| **React site, component-heavy** (5+ Magic UI pieces, app-like) | Install `motion` and translate the Tailwind classes into the site's CSS, or add Tailwind to the project. **Pick one; never mix both styling systems in one site.** |
| **React site, 1-4 effects** | Port them. It is less code than adding a styling system. |

Whichever way you go:
- **Rethink for the brand.** Map colors to the site's tokens, set the tempo to the
  brand's motion feel, and mirror for RTL. Never paste a component verbatim, the same
  rule as for VidTSX sources.
- **Keep the TSX law.** Motion values are fine. A component that sets React state
  per frame is not. Canvas components (`flickering-grid`, `particles`) should join the
  site's single rAF loop, or at least pause off-screen with an IntersectionObserver.
- **Credit in source:** `/* ported from Magic UI (MIT, magicui.design) */`. If you copy
  substantial code verbatim, keep the MIT notice.
- **Check the licenses of the component's own dependencies.** Example: `dotted-map`
  depends on `svg-dotted-map`, which had no license on npm in 2026-10. That map was
  hand-built instead: a dot `<pattern>` clipped to a coastline polygon, about 2KB of
  static SVG.

## Catalog

Grouped by job. "Deps" is what the React version needs beyond React itself.
Every row ports to vanilla unless noted. Snapshot: 2026-10.

### Backgrounds and surfaces
| Component | What it is | Use it for | Deps |
|---|---|---|---|
| flickering-grid | Canvas of squares flickering at random opacity | LED/tech/trade heroes, "live system" feel | none |
| animated-grid-pattern | SVG grid whose cells light up | SaaS, data, engineering | motion |
| interactive-grid-pattern | Grid cells react to the pointer | playful tech heroes | none |
| grid-pattern / dot-pattern / striped-pattern | Static SVG patterns | quiet texture behind sections | none |
| retro-grid | Perspective grid scrolling to the horizon | retro, gaming, synthwave | none |
| grid-beams | Grid with light beams travelling it | futuristic infrastructure | motion |
| warp-background | Time-warp tunnel behind a card | launches, "the future" moments | motion |
| particles | Floating particles that drift with the pointer | depth, night skies, luxury | none |
| meteors | Diagonal streaks with tails | **sparks** (trades), shooting stars | none |
| ripple | Concentric expanding rings | emphasize a logo, button or pin | none |
| glyph-matrix | Grid of shifting glyphs | hacker/AI/tech identity | none |
| progressive-blur | Blur gradient at a scroll edge | galleries, long lists, premium polish | none |
| light-rays *(repo tree)* | Soft swinging light beams from the top | heroes, stage lighting, hospitality | motion |
| noise-texture, hexagon-pattern, backlight *(repo tree)* | Grain, hex tiling, glow-behind | material texture, sci-fi, product glow | varies |

### Text
| Component | What it is | Use it for | Deps |
|---|---|---|---|
| animated-shiny-text | Glare sweeping across text | a key line "powered on" (gold, chrome) | none |
| animated-gradient-text | Text gradient that cycles colors | badges, announcements | none |
| aurora-text | Soft aurora colors inside text | luxury, wellness, creative | none |
| line-shadow-text | Moving striped shadow under text | bold display headings | motion |
| sparkles-text | Sparkles popping around a word | celebration, beauty, kids (use sparingly) | motion |
| hyper-text | Letters scramble, then resolve | tech, security, reveals | motion |
| morphing-text / word-rotate / flip-text | Cycle through words | "we build X / Y / Z" heroes | none / motion |
| typing-animation | Characters type in | terminals, AI, chat | motion |
| text-animate | Many entrance presets (blur, slide, scale) | headline entrances (**see the LCP law**) | motion |
| text-reveal | Words light up as you scroll | statement sections (the scroll-lit pattern) | motion |
| box-reveal | A box slides off to reveal text | editorial, portfolios | motion |
| blur-fade | Blur-and-fade entrance | the default reveal for cards and images | motion |
| highlighter | Hand-drawn marker on a phrase | emphasis in long copy | rough-notation |
| spinning-text | Text on a rotating circle | badges, stamps ("since 1998") | motion |
| comic-text, video-text | Comic-style pop; video playing inside letters | playful brands; cinematic titles | motion / none |
| kinetic-text, dia-text-reveal *(repo tree)* | Kinetic type; diagonal reveal | posters, launches | varies |

### Buttons and interaction
| Component | What it is | Use it for | Deps |
|---|---|---|---|
| shimmer-button | Light travels around and across a button | **the primary CTA** | none |
| pulsating-button / ripple-button | Pulse rings; click ripple | WhatsApp/call CTAs, floating buttons | none |
| rainbow-button / shiny-button | Animated gradient; glossy | playful or premium secondary CTAs | none / motion |
| interactive-hover-button | Arrow-and-label swap on hover | "learn more" links | none |
| animated-subscribe-button | Morphs from idle to done | forms, sign-ups | motion |
| confetti / cool-mode | Bursts on success; particles on click | success states, delight (rarely) | canvas-confetti / none |
| scratch-to-reveal | Scratch-off surface | promos, reveals | motion |
| lens | Magnifier over an image | product detail, architecture | motion |
| pointer / smooth-cursor | Custom pointer; physics cursor | creative portfolios (desktop only) | motion / framer-motion |
| glare-hover *(repo tree)* | Glare sweeps a card on hover | product cards, credit cards | varies |
| animated-theme-toggler, script-copy-btn | Theme switch; copy-code button | apps, developer docs | lucide-react / shiki |

### Cards, borders and layout
| Component | What it is | Use it for | Deps |
|---|---|---|---|
| border-beam | A light runs along the border | **current in a wire**, featured cards, CTA boxes | motion |
| shine-border | Animated gradient border | premium cards, pricing | none |
| magic-card | Spotlight follows the pointer and lights the border | service grids, features | motion |
| neon-gradient-card | Glowing neon gradient frame | nightlife, gaming, highlights | none |
| bento-grid | Asymmetric feature grid | SaaS features, portfolios | @radix-ui/react-icons |

### Motion, data and storytelling
| Component | What it is | Use it for | Deps |
|---|---|---|---|
| animated-beam | Light travels along paths between elements | **process flows, integrations, circuits** | motion |
| orbiting-circles | Icons orbit a center | ecosystems, "everything connects to us" | none |
| number-ticker | Counts up to a value | stats (**real numbers only**) | motion |
| animated-circular-progress-bar | Circular gauge | scores, progress, capacity | none |
| animated-list | Items arrive in sequence | notifications, live activity, testimonials | motion |
| marquee | Infinite scroller | logos, services, cities, reviews | none |
| scroll-based-velocity | Scrolling text whose speed follows scroll speed | bold brand bands | motion |
| scroll-progress | Reading-progress bar | long pages (style it as the brand: a wire, a rope) | motion |
| arc-timeline | Curved timeline | roadmaps, history | none |
| globe | Interactive WebGL globe | international reach | cobe, motion |
| icon-cloud | 3D cloud of icons | tech stacks, skills | none |
| dock | macOS-style magnifying dock | app-like navigation | motion |
| dotted-map *(repo tree)* | Dotted world map with markers | locations, service areas (see the license note) | svg-dotted-map |

### Mockups and media
| Component | What it is | Use it for | Deps |
|---|---|---|---|
| safari / iphone-15-pro / android | Browser and phone frames | showcasing a product or site | none |
| hero-video-dialog | Thumbnail that opens a video | product demos, brand films | motion |
| terminal / code-comparison / file-tree | Developer surfaces | dev tools, docs | none / shiki |
| tweet-card / client-tweet-card | Embedded tweet cards | social proof | react-tweet |
| avatar-circles | Overlapping avatars | "join 2,000 customers" (real numbers) | none |
| pixel-image | Image rendered in pixels | retro, gaming, reveals | none |

## Pairing by brand mood

Pick **4-8 effects that carry one story**. More effects without a story read as noise.

- **Trades / industrial** (electricians, builders, workshops): flickering-grid (LEDs),
  border-beam (current), animated-beam (circuits), meteors recast as sparks, ripple,
  number-ticker for real specs, a marquee of services and cities.
- **Luxury / hospitality:** shine-border, particles (slow), blur-fade, text-reveal,
  progressive-blur, light-rays, a restrained animated-shiny-text in gold.
- **Tech / SaaS:** bento-grid, animated-beam (integrations), orbiting-circles,
  terminal, safari/iphone mockups, globe, animated-grid-pattern, hyper-text.
- **Food / retail:** marquee of products, word-rotate, ripple on CTAs, magic-card on
  menu items, sparkles-text once at most.
- **Creative / portfolio:** morphing-text, pixel-image, lens, smooth-cursor (desktop
  only), box-reveal, line-shadow-text.
- **Events / launches:** number-ticker countdowns, confetti on RSVP, warp-background,
  globe for international audiences.

## Proven vanilla ports (electrical contractor landing page, 2026-10)

### Border beam: a light runs the border
```css
.bb { position: relative; }
.bb-beam {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  border: 1.5px solid transparent;
  /* show only the border ring */
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box;
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0) border-box;
  display: none;
}
@supports (offset-path: rect(0 auto auto 0 round 20px)) { .bb-beam { display: block; } }
.bb-beam::before {
  content: ''; position: absolute; width: 110px; aspect-ratio: 1;
  background: linear-gradient(to left, var(--accent), #fff 30%, transparent);
  offset-path: rect(0 auto auto 0 round 20px);
  animation: beam 6s linear infinite;
}
@keyframes beam { to { offset-distance: 100%; } }
/* on grids: run only on hover, so 12 cards are not all animating at once */
.card .bb-beam::before { animation-play-state: paused; }
.card:hover .bb-beam::before { animation-play-state: running; }
```

### Flickering grid: canvas, bucketed fills
Bucket each square's opacity into about 6 levels. Each redraw is then 6 `fill()`
calls with many `rect()`s each, instead of thousands of `fillStyle` changes.
Redraw at about 20fps (a flicker doesn't need 60) and pause off-screen. Mask it
with a CSS `radial-gradient` so it glows around the subject.

### Animated beam: current between nodes
Measure the node icons with `getBoundingClientRect`, and draw a quadratic path
between each pair (`M a Q control b`) with `pathLength="1"`. Each path is drawn
twice: a dim base and a pulse.
- **Pulse dash:** set the dash period **longer than the path**
  (`stroke-dasharray: 0.16 1.3`). With a period of 1, a sliver of the dash always shows
  at one end.
- **Pulse travel:** animate `stroke-dashoffset` from `0.16` to `-1`.
- **Sequencing:** stagger beams with `animation-delay: calc(var(--i) * 1s)` in a cycle
  of `nodes x 1s`. Each node gets a glow keyframe at the moment its beam arrives.
- **Resize:** re-measure with a ResizeObserver.

### Number ticker: the value lives in the HTML
Put the **final** number in the markup, so crawlers, no-JS visitors and reduced
motion all see it. JS counts from 0 to `data-tick` once the element is in view,
then sets the exact final text. Use `font-variant-numeric: tabular-nums`, so the
counting digits don't jitter.

### Shimmer CTA, shiny text, meteors, ripple, marquee, spotlight
- **Shimmer:** a `::after` gradient sweeping with `translateX`, with a pause built
  into the keyframes (`0%` to `45%` sweeps, `45%` to `100%` rests).
- **Shiny text:** a 250%-wide gradient with `background-clip: text`, animating
  `background-position`.
- **Meteors:** `rotate(215deg) translateX(-460px)` keyframes. The tail is a `::before`
  gradient line. Set `left: 0` explicitly, because in RTL the static position of an
  absolutely positioned element is the right edge.
- **Ripple:** 3-4 stacked rings with the same keyframe and staggered delays.
- **Marquee:** a duplicated track animating `translateX(50%)`. In RTL it travels left to
  right. Build the duplicate in JS and mark it `aria-hidden`, so crawlers don't read
  repeated keywords.
- **Spotlight (MagicCard):** one delegated `pointermove` listener on `document` sets
  `--mx/--my` on the hovered card. A `::before` radial gradient reads them.

## Laws (learned the hard way)

1. **Never hide the LCP element.** `text-animate` and `blur-fade` start at opacity 0,
   and an invisible headline is not an LCP candidate, so first paint looks late.
   Animate the decorations around the H1, or start the H1 visible and only add motion.
2. **Decorative layers must not move when fonts load.**
   - Font swaps re-wrap headlines and change heights. A light-ray layer sized in `%`
     of the hero moved with it, and Lighthouse counted 0.125 CLS.
   - Use fixed px offsets for decorative layers.
   - Give heroes a `min-height`, so a re-wrap can't push down the section below.
3. **Reserve space for anything JS fills** (marquee tracks, tickers), or it shifts
   layout when it fills in.
4. **Content stays crawlable.**
   - Every word that matters must be in static HTML.
   - Effects decorate it; they never generate it.
   - Mark decorative duplicates `aria-hidden`.
5. **Performance:**
   - Use one IntersectionObserver per canvas and pause off-screen.
   - Don't animate `box-shadow` or `filter` on many elements at once.
   - Prefer `transform` and `opacity`.
   - Gate `offset-path` effects with `@supports`.
6. **Reduced motion turns everything off,** canvases included. Draw the canvas
   statically once.
7. **When the jank probe regresses, measure a control first.**
   - Run the same page with all effects disabled, and an unchanged site, under the
     same probe.
   - On 2026-10-14 every site, effects or not, read a steady 33ms because of machine
     state, not the page.
8. **RTL mirrors motion:** marquee direction, beam flow, shimmer sweep direction and
   progress bars (`transform-origin: right`).
9. **Real numbers only** in tickers, avatars and counters. "16 cities served" was
   true for that contractor; "500+ projects" was not known, so it wasn't used.
