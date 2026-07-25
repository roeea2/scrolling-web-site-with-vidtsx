```
██████╗    ██████╗   ███████╗  ███████╗   █████╗   ██╗
██╔══██╗  ██╔═══██╗  ██╔════╝  ██╔════╝  ██╔══██╗  ██║
██████╔╝  ██║   ██║  █████╗    █████╗    ███████║  ██║
██╔══██╗  ██║   ██║  ██╔══╝    ██╔══╝    ██╔══██║  ██║
██║  ██║  ╚██████╔╝  ███████╗  ███████╗  ██║  ██║  ██║
╚═╝  ╚═╝   ╚═════╝   ╚══════╝  ╚══════╝  ╚═╝  ╚═╝  ╚═╝
```

# Scrolling Web Site with VidTSX

A [Claude Code](https://claude.com/claude-code) skill that turns "build me a
site" into a real interview, then a real, production-grade animated website in
TSX (React + TypeScript + Vite).

![AERIE - a scroll-film site built with this skill](assets/aerie-demo.gif)

> Above: **AERIE**, a demo built with this skill. The whole page is one
> continuous cinematic shot - as you scroll, a live altimeter counts down the
> thousand-meter descent from the cloud-tops to the lobby, and the film scrubs
> frame-by-frame on a canvas.

It is a **process, not a template**. Claude runs a short structured interview,
pitches 2-3 named creative concepts, art-directs the world (palette, type,
motion, copy), and only then writes the site - from scratch, for that brand.
Every build ships with a responsive sweep and a measured verification pass
(screenshots, a jank test, an Open Graph card) before it's called done.

## What it builds

- **2D motion sites** - scroll-driven reveals, parallax, spring-physics
  entrances, kinetic type, seeded particle systems.
- **3D scenes** - react-three-fiber heroes or full-page 3D, with a real
  performance budget (instancing, mesh caps, 3-point lighting).
- **Scroll-film sites** - the page as one continuous cinematic shot, scrubbed
  by scroll (that's the AERIE demo above).

## What's inside

```
SKILL.md                          the process: interview, art-direct, build, verify, ship
references/tsx-motion-law.md      the build law (rAF + refs, seeded random, spring accents, 3D budget)
references/example-gallery.md     abstract idea menu with seed prompts
references/example-library.md     catalog of 26 real VidTSX compositions, with port math
references/motion-patterns.md     8 production-tested techniques, ready to port
references/perf-playbook.md       jank sources and fixes (rAF deltas, max < 50ms)
references/asset-pipeline.md      imagery sourcing, budgets, favicon + OG card checklist
references/rtl-hebrew.md          Hebrew/RTL: font pairings, bidi rules, mirrored motion
scripts/verify.mjs                full sweep: 5 viewports, RTL-safe overflow, jank probe, screenshots
scripts/capture-og.mjs            real-hero OG card at 1200x630 with size budget
```

## Example gallery

Not sure what you want? The skill can offer concrete starting points and build
from any of them. A curated catalog with seed prompts lives in
[`references/example-gallery.md`](references/example-gallery.md):

- **Logo & brand** - particle-converge reveal, glitch resolve, minimal fade
- **Social CTAs** - follow / subscribe / link-in-bio motion
- **Countdowns** - dramatic, New Year fireworks, launch 3-2-1
- **Educational** - loop visualization, Pythagorean proof, binary counter, fractions
- **Data & charts** - self-drawing bar / pie / line
- **Typography** - kinetic type, quote reveal, typewriter
- **Product reveals** - silhouette build, rotating shot, icon morph
- **Gaming & retro** - Game Over / CRT, 8-bit character, achievement unlock
- **Intros & outros** - channel intro, podcast wave, social outro
- **3D scenes** - nature (orbiting windmill), first-person POV coaster, landing-to-ad

More live TSX animation examples (2D and 3D) are at **https://vidtsx.com**.

### Motion library: real sources, real math

If you own VidTSX example files, drop the .tsx sources into one folder outside
any repo (e.g. `~/vidtsx-library/`) and tell Claude where they are. The catalog
in [`references/example-library.md`](references/example-library.md) indexes 26
compositions by filename - per-letter jump physics, packet-flow pipelines,
before/after sliders, spring preset palettes - with the frame-to-live
conversion rules for porting them into a site. Sources stay example-reference
only: never committed, never pasted verbatim. No sources? The same techniques
ship distilled in [`references/motion-patterns.md`](references/motion-patterns.md).

## Installation

Copy (or clone) this repository into your Claude Code skills directory:

```bash
git clone https://github.com/roeea2/scrolling-web-site-with-vidtsx.git \
  ~/.claude/skills/scrolling-web-site-with-vidtsx
```

Or, if you already have the skills folder cloned as a parent repo, drop this
directory in as-is - the only requirement is that `SKILL.md` sits at
`~/.claude/skills/scrolling-web-site-with-vidtsx/SKILL.md`. Restart Claude Code
(or start a new session) so it picks up the new skill.

No API keys, accounts, or extra dependencies are required to use the skill
itself. The sites it generates use plain Vite + React + TypeScript; Claude
installs those per-project as needed.

One optional setup, needed only for the verification scripts
(`scripts/verify.mjs`, `scripts/capture-og.mjs`):

```bash
cd ~/.claude/skills/scrolling-web-site-with-vidtsx/scripts && npm install
```

## Usage

Just ask, in plain language, in any Claude Code session:

> "Build me an animated site in TSX for my coffee brand"
> "I want a scrolling website with 3D, interview me first"
> "Make a motion site like the vidtsx.com examples"
> "Build me a Hebrew site for my law firm" (full RTL, real Hebrew font pairing)

Claude will:

1. **Interview you** - what you're building, language and direction (English
   LTR / Hebrew RTL / bilingual), brand assets or full creative
   freedom, which motion language (2D / 3D / scroll-film), the top-to-bottom
   visitor journey, the sections after the hero, and where it should go live.
   Every question has a "you decide" option if you'd rather not choose, and it
   can offer concrete examples from the gallery or the local motion library if
   you're unsure.
2. **Pitch 2-3 named concepts** with a concrete walkthrough of what you'd
   actually see scrolling through each one, one marked as recommended.
3. **Art-direct the world** - exact palette, a real type pairing (with proven
   Hebrew pairings for RTL builds), a logo lockup, before writing any code.
4. **Build it** - a from-scratch TSX site following the motion and
   performance laws in [`references/tsx-motion-law.md`](references/tsx-motion-law.md),
   porting motion from the example library when a concept calls for it.
5. **Verify it** - `scripts/verify.mjs`: a responsive sweep across five
   viewports with zero horizontal overflow (both edges, RTL-safe), a measured
   jank test (p95/max frame time, not average FPS), fixed-chrome collision
   checks, and an accessibility floor - plus a real Open Graph share card
   captured from the finished hero.
6. **Ship it** - to your own Vercel account on request, only after a
   pre-publish exposure check.

You can invoke it explicitly too, by name, in any Claude Code session that has
the skill installed.

## Follow RoeeAI

Built and maintained by [RoeeAI](https://roeeaizman.com). New AI automation
guides and carousels, in Hebrew, every week:

- Instagram: [@roeeaiautomation](https://instagram.com/roeeaiautomation)
- YouTube: [@roeea2](https://www.youtube.com/@roeea2)
- Science channel: [@RoeeAIScience](https://www.youtube.com/@RoeeAIScience)
- HiTechPark channel: [@HiTechParkIL](https://www.youtube.com/@HiTechParkIL)
- Free guides: [roeeaizman.com/#guides](https://roeeaizman.com/#guides)

## License

MIT - see [LICENSE](LICENSE).
