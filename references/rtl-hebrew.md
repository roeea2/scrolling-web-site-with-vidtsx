# Hebrew / RTL sites - fonts, motion, and the RTL law

Build a Hebrew site as a first-class RTL experience, not an LTR site with
Hebrew pasted in. Everything below applies when the interview answer is
"Hebrew" or "bilingual Hebrew/English".

## Fonts (all on Google Fonts, hebrew subset)

Display faces with real character:
- **Karantina** - condensed editorial display. Huge headlines, poster energy.
- **Secular One** - geometric, confident, modern brand voice.
- **Suez One** - heavy serif display. Heritage, food, wine, premium.
- **Frank Ruhl Libre** - elegant serif. Law, finance, academia, luxury.
- **Alef** - clean, neutral, slightly tech.

Body faces:
- **Heebo** - the modern default. Pairs with almost anything.
- **Assistant** - light and airy, great under heavy display faces.
- **Rubik** - rounded, friendly, consumer brands.
- **Varela Round** - soft geometric, warm products.

Proven pairings:
- Karantina + Rubik (editorial / D2C)
- Secular One + Assistant (tech / SaaS)
- Frank Ruhl Libre + Heebo (luxury / professional services)
- Suez One + Varela Round (food / wine / hospitality)

Loading: Google Fonts css2 URL, `&display=swap`. The hebrew subset is served
automatically via unicode-range. Preconnect to fonts.gstatic.com.

## Typography rules for Hebrew

- **No italics.** Hebrew has no italic tradition. Emphasis = weight or color,
  never `font-style: italic`.
- **Descenders clip.** Final letters (ך ן ף ץ) descend below the baseline.
  Kinetic-type line masks (`overflow: hidden` on a line) need extra
  padding-bottom, roughly 0.12em, or descenders get guillotined.
- **Masked words still need real spaces.** When each word sits in its own
  `overflow: hidden` mask, it is tempting to separate them with
  `padding-inline-end`. Do not: the rendered text then has no whitespace, so
  the heading reads `משפטמסחרי.` to copy-paste, screen readers and crawlers
  while looking perfect on screen. Emit a real space text node between the
  masks (`{i > 0 && ' '}`) and use padding only for optical tuning. This
  defect is invisible to screenshots - assert on `innerText`, not pixels.
- **Letter-spacing** is safe on sans display faces, avoid on serif at body
  sizes.
- **Bidi.** Latin brand names, numbers, and URLs inside Hebrew copy: wrap in
  `<span dir="ltr">` when order matters (prices, phone numbers, version
  strings). Never let CSS reorder digits around punctuation.
- **Line-height** ~1.5-1.65 for body; Hebrew reads dense, give it air.

## The RTL law (motion flips too)

- `dir="rtl"` + `lang="he"` on `<html>`. Use CSS logical properties
  (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`) so the
  layout mirrors itself. Physical `left/right` only when you MEAN the screen
  side (fixed chrome, absolutely positioned decor).
- **Direction of reading is right to left, so direction of motion follows:**
  - Marquee / horizontal scroll scenes travel left-to-right (content enters
    from the left edge). A horizontal showcase that pans the track with
    `translateX(-p * dist)` in LTR becomes `translateX(p * dist)` in RTL, and
    the track starts at the inline-start (right) edge.
  - Scroll progress bars: `transform-origin: right`.
  - Per-letter / per-word staggers keep DOM order, but entrance slides
    mirror: what entered from `translateX(-30px)` in LTR enters from
    `translateX(30px)` in RTL.
  - **Bidi does NOT rescue a split Latin wordmark.** Kinetic type splits text
    into `display: inline-block` spans, and inline-blocks lay out in the
    CONTAINER's direction - there is no text run left for the bidi algorithm
    to reorder. So `'ROEEAI'.split('')` inside `dir="rtl"` renders `IAEEOR`.
    Any per-character split of Latin content needs an explicit `dir="ltr"` on
    the element doing the splitting. Hebrew splits are fine either way
    (Hebrew has no shaping), which is what makes this easy to miss.
  - CTA arrows flip: "Visit site ->" points LEFT in RTL. Same for carousel
    chevrons and "continue" icons.
- **Scroll-driven sticky scenes** (convergence grids, pinned word highlights)
  work unchanged; only their horizontal components mirror.
- **Library ports** (see example-library.md): TypographyJumpers,
  DataFlowPipeline, QuoteCard, spring presets, particle systems are
  script-agnostic and port directly. ComparisonSlider and carousels must
  mirror their travel direction. CodeAnimation/TerminalInstallCTA stay LTR
  even in a Hebrew site (code is LTR): keep the mockup `dir="ltr"` inside the
  RTL page.
- **Bilingual sites:** content Hebrew RTL, latin brand mark stays LTR. One
  type system per script; the display Hebrew face leads, the Latin face
  appears only in the logo/brand lockup and code.

## Build trap: never style direction with `:dir()`

Vite's CSS minifier (lightningcss) downlevels `:dir()` for older browser
targets by rewriting it into a language list:

```
.card:dir(rtl)   ->  .card:is(:lang(he),:lang(ar),:lang(fa), ...)
.card:dir(ltr)   ->  .card:not(:lang(he),:lang(ar),:lang(fa), ...)
```

On a `lang="he"` document every element inherits `lang=he`, so the `rtl` rule
matches EVERYTHING and the `ltr` rule matches NOTHING. It compiles clean, it
looks correct in source, and it only shows up as wrong fonts and alignment on
the elements that should have stayed LTR.

Style on the `dir` attribute instead - no toolchain rewrites attribute
selectors:

```css
.card-body[dir='rtl'] .card-name { font-family: 'Heebo', sans-serif; }
.card-body[dir='ltr'] .card-name { text-align: left; }
```

Set `dir` explicitly from the data (`dir={isHebrew ? 'rtl' : 'ltr'}`) rather
than relying on `dir="auto"`, so the CSS has something deterministic to match.
This matters on any mixed-language page: a Hebrew site listing English titles,
a bilingual portfolio, code blocks inside Hebrew prose.

## RTL overflow check (responsive sweep addition)

In RTL, horizontal overflow escapes to the LEFT and `scrollWidth - innerWidth`
can read 0 while content is visibly cut. Check BOTH:
`document.documentElement.scrollWidth - window.innerWidth <= 0` AND
`Math.abs(document.documentElement.scrollLeft) + window.innerWidth <=
document.documentElement.scrollWidth + 1` at every depth, or simpler: scroll
to the extreme inline-start and inline-end and confirm no clipped content in
screenshots. The 5-viewport sweep and collision checks are unchanged.
