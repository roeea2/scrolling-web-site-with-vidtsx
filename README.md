```
####.  .###.  #####  #####  .###.  #####
#...#  #...#  #....  #....  #...#  ..#..
#...#  #...#  #....  #....  #...#  ..#..
####.  #...#  ####.  ####.  #####  ..#..
#.#..  #...#  #....  #....  #...#  ..#..
#..#.  #...#  #....  #....  #...#  ..#..
#...#  .###.  #####  #####  #...#  #####
```

# Scrolling Web Site with VidTSX

A [Claude Code](https://claude.com/claude-code) skill that turns "build me a
site" into a real interview, then a real, production-grade animated website in
TSX (React + TypeScript + Vite).

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
  by scroll.

TSX animation examples and further reference patterns (2D and 3D) live at
**https://vidtsx.com**.

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

## Usage

Just ask, in plain language, in any Claude Code session:

> "Build me an animated site in TSX for my coffee brand"
> "I want a scrolling website with 3D, interview me first"
> "Make a motion site like the vidtsx.com examples"

Claude will:

1. **Interview you** - what you're building, brand assets or full creative
   freedom, which motion language (2D / 3D / scroll-film), the top-to-bottom
   visitor journey, the sections after the hero, and where it should go live.
   Every question has a "you decide" option if you'd rather not choose.
2. **Pitch 2-3 named concepts** with a concrete walkthrough of what you'd
   actually see scrolling through each one, one marked as recommended.
3. **Art-direct the world** - exact palette, a real type pairing, a logo
   lockup, before writing any code.
4. **Build it** - a from-scratch TSX site following the motion and
   performance laws in [`references/tsx-motion-law.md`](references/tsx-motion-law.md).
5. **Verify it** - a responsive sweep across five viewports with zero
   horizontal overflow, a measured jank test (p95/max frame time, not average
   FPS), and a real Open Graph share card generated from the finished hero.
6. **Ship it** - to your own Vercel account on request, only after a
   pre-publish exposure check.

You can invoke it explicitly too, by name, in any Claude Code session that has
the skill installed.

## License

MIT - see [LICENSE](LICENSE).
