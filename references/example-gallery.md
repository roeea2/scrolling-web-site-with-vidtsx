# Example gallery - starting points to offer in the interview

A menu of proven VidTSX animation examples. During STEP 0, when a user is unsure
what they want (or wants a motion accent inside a larger site), offer a few of
these as concrete starting points rather than asking an open "what do you want?".
Live versions of many of these patterns are at https://vidtsx.com - browse them
for reference, then adapt to the brand; never paste one in verbatim.

Each line is `Name - what it animates` plus a seed prompt you can build from.

## 2D examples (TSX motion)

### Logo & brand
- **Logo reveal** - particles converge and snap into the wordmark.
  *"particles converge to form the text 'ACME' with a satisfying snap"*
- **Glitch logo** - letters resolve through a cyberpunk glitch.
  *"each letter appearing through a glitch effect, cyberpunk style"*
- **Minimal fade-in** - subtle scale + fade for a restrained brand.
  *"logo fades in with a subtle scale animation, minimalist style"*

### Social CTAs
- **Follow button** - pulsing button with floating social icons (vertical).
- **Subscribe bounce** - bounces in, pulses twice, settles (red/white).
- **Link-in-bio arrow** - text with a downward arrow, clean and vertical.

### Countdowns & timers
- **Dramatic countdown** - 5 to 1 with sharp transitions, then a reveal.
- **New Year countdown** - 10 to 1, fireworks burst on zero (dark + gold).
- **Launch countdown** - 3-2-1 building anticipation to a flash reveal.

### Educational
- **Loop visualization** - a counter 0 to 5 with code syntax appearing.
- **Pythagorean theorem** - squares grow on each side of a right triangle.
- **Binary counting** - 0 to 15 as light switches with decimal readout.
- **Fraction pizza** - slices divide to show 1/2, 1/4, 3/4.

### Data & charts
- **Bar chart** - bars animate in sequentially (corporate).
- **Pie chart** - builds segment by segment, smooth and minimal.
- **Line graph** - the line draws itself with a trailing glow.
  (For any chart work, load the `dataviz` skill for color/mark discipline.)

### Text & typography
- **Kinetic typography** - words hit with impact, key words scaled up.
- **Quote reveal** - each word fades in with a slight bounce.
- **Typewriter** - characters appear one by one with a blinking cursor.

### Product reveals
- **Silhouette reveal** - light particles build to a glowing product silhouette.
- **Rotating product shot** - the object spins in from the side and lands with a bounce.
- **Icon morph** - abstract shapes resolve into the final app icon.

### Gaming & retro
- **Game Over screen** - score counts up to 99,999 with scanlines / CRT effect.
- **Pixel character** - 8-bit walk cycle with "Player 1 Ready".
- **Achievement unlock** - trophy with sparkles, text slides in.

### Intros & outros
- **Channel intro** - name zooms in on an energy burst, subscribe pulses.
- **Podcast intro** - sound-wave visualization behind the show name.
- **Outro** - "Thanks for watching" with a row of animated social icons.

## 3D examples (react-three-fiber / Three.js)

- **Nature scene** - e.g. a windmill in a tulip field, blades turning, camera
  orbiting (~10s). Or rolling hills under a gradient sky with scattered pines.
- **First-person POV** - a roller-coaster ride: lift hill, drops, banked turns,
  airtime hills, helix (~30s). Camera-on-rails with subtle wobble.
- **Landing-to-ad** - a 30s product promo arc: hook (0-3s), features (3-15s),
  social proof (15-25s), CTA (25-30s).

All 3D examples follow the 3D law in `tsx-motion-law.md`: time-based animation,
`useMemo` geometry, instancing past ~50 objects, a mesh budget, 3-point
lighting, and no post-processing passes.
