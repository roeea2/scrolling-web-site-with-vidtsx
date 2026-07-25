# Asset pipeline - imagery, favicons, and social cards

Every site ships with generated or sourced imagery, a favicon, and an OG
card. This is the checklist that keeps assets from being the afterthought
that breaks the launch.

## Sourcing imagery

- AI generation (your tool of choice) or stock. Either way: one consistent
  art direction per site (lighting, palette, grain) or the images will
  betray that they came from different prompts.
- Prompt pattern that works: `<subject>, <setting>, editorial <market>
  photography, <lighting>, <palette anchors as hexes or color words>,
  photorealistic, <aspect>`.
- Generate at the aspect you will render: hero 16:9, cards 4:3, portraits
  1:1, product/bottle shots 3:4. Cropping a 1:1 into a 16:9 hero wastes the
  best pixels.
- Check your generation credits before a bulk run; running dry mid-build
  leaves half the slots filled with placeholders.

## Format and weight

- Photos: JPEG quality 82-85 (sips or ImageMagick). Never ship multi-MB
  PNGs as content images.
- Budgets: hero < 500 KB, cards < 300 KB each, total page images < 2 MB.
- Illustrations/logos/icons: inline SVG, always.
- `loading="lazy"` on everything below the fold; hero image eager with
  explicit width/height to avoid CLS.

## Favicon

- Inline-SVG logo lockup, exported as `public/favicon.svg`. It is the same
  mark used in the nav, not a generic initial in a colored square (unless
  the brand IS an initial in a colored square).

## OG / social card

- `public/og.jpg`, 1200x630, < 300 KB. Capture the real hero with
  `scripts/capture-og.mjs` instead of designing a separate card: the hero
  IS the brand.
- Full meta set with ABSOLUTE production URLs: `og:title`,
  `og:description`, `og:type`, `og:url`, `og:image`, plus
  `twitter:card` = `summary_large_image`.
- Proof step (never skip): `curl -sI https://<site>/og.jpg` returns 200 and
  `curl -s https://<site> | grep og:image` shows the absolute URL.

## Hard-won lessons

- An `og:image` tag pointing at a file that does not exist fails SILENTLY:
  the page looks done, the card 404s. Always curl it after deploy.
- Never hardcode one shared image across variants (three product cards
  rendering the same photo reads as a bug, not a shortcut). Each variant
  gets its own asset or an obviously different crop.
- AI faces: fine for fictional personas, never present an AI face as a real
  person's photo. Real person = real photo.
