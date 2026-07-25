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
  - Per-letter / per-word staggers keep DOM order (bidi handles the rest),
    but entrance slides mirror: what entered from `translateX(-30px)` in LTR
    enters from `translateX(30px)` in RTL.
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

## RTL overflow check (responsive sweep addition)

In RTL, horizontal overflow escapes to the LEFT and `scrollWidth - innerWidth`
can read 0 while content is visibly cut. Check BOTH:
`document.documentElement.scrollWidth - window.innerWidth <= 0` AND
`Math.abs(document.documentElement.scrollLeft) + window.innerWidth <=
document.documentElement.scrollWidth + 1` at every depth, or simpler: scroll
to the extreme inline-start and inline-end and confirm no clipped content in
screenshots. The 5-viewport sweep and collision checks are unchanged.
