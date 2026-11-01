# Film direction: one film, not a slideshow

Sources, all rewritten for this skill's laws (nothing vendored, no media copied):
- ClaudeAnimationBase by John Heibel, https://github.com/JohnHeibel/ClaudeAnimationBase (MIT):
  timing for the viewer's reads, the animation principles, a transition at every seam. Its
  character and its brush engine are not used.
- lemo-opuscar by LemoLab, https://github.com/lemomo-ai/lemo-opuscar (MIT for code and docs;
  its films are CC BY 4.0 and are not copied): hold times for on-screen text, three candidate
  structures, the sound rules, stepped drawing under a smooth camera, review strips.
- onetake by feitangyuan, https://github.com/feitangyuan/onetake (PolyForm Noncommercial
  1.0.0, which bars commercial use of its code; a paid tier sells that right): ideas only,
  written here from scratch: carry at every boundary, rhythm in numbers, a camera that is
  operated, shutter blur. None of its code, text or media is used.

`opus-videos.md` says how a code film is briefed and rendered; this file says how it is
directed so it reads as one piece. It applies to the video path (SKILL.md steps 2-4), and the
rhythm, carry and reads sections apply to live heroes, phone demos and scroll films too.
Every recipe keeps the render contract: each frame a pure function of `t`. The snippets use
`clamp`, `seg`, `lerp`, `inOutCubic` and `outBack` from `video-starter.html`, plus:
```js
const sstep = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const inOutSine = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
const inOutExpo = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? 2 ** (20 * p - 10) / 2 : (2 - 2 ** (10 - 20 * p)) / 2);
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // seeded 0..1
```

## 1. Before any beat: the treatment

1. **Three structures, then choose.** Each a few lines: one element that transforms through
   everything; one camera move through scale; a before and after; a chain reaction where
   each beat causes the next; a countdown; a list that turns. Choose from the topic; the
   first idea for a style is usually its cliche.
2. **Logline:** one sentence. The subject wants something, something changes, it ends
   differently from how it began. The ending rhymes with the opening (the same place, pose
   or shape, changed).
3. **Beat sheet**, one row per beat:
   `t | beat | what moves | what is still | what carries into the next | the reads | sound`.
4. **Cue map:** BPM and bars (`opus-videos.md` brief template); every cut, hit and line on
   the grid.
5. Approve the metaphor, then one still in the real style (`--preview`), then motion. A
   wrong idea costs a sentence at step one and a full render at step three.

## 2. Carry: every boundary has a survivor

A film reads as slides when each beat replaces the last, however good each beat is and
however good the rhythm. At every boundary, name the element that survives it and visibly
moves or scales into the next beat. If nothing survives, it is a slide change.

| Carry | What happens | Reach for it when |
|---|---|---|
| Morph | the thing pressed becomes the result (a button becomes the window, a chat bubble becomes the report) | an action has an outcome |
| Iris | the next world opens from the subject's screen point | the subject opens its own world |
| Push through | the camera pushes into one card until it is the scene, zoom eased in log space | one item among many is the next scene |
| Hop | the subject arcs to its next slot and lands with a squash | the subject chooses the next thing |
| Gather | the cast travels on arcs into one group, then the lockup | many become the brand |
| Match cut | the same shape or motion across the cut | two places share a form |
| Cut on action | cut mid-move, finish the move in the next shot | energy must not drop |

- Build a carry from ONE element changing. Two elements crossfading (a card fading out
  while a page fades in at its size) reads as a replacement.
- Bare cuts only inside a burst of hits (3 or more inside 1.5 s) or into the end card.
- On a site the same law is `tsx-motion-law.md`'s scene handoff; a morph is FLIP (measure
  both rects once, animate transform), never width and height.
```js
// morph one rect into another: one element, pure in t (DOM: translate + scale from 0 0; or canvas)
function morphRect(t, t0, t1, A, B, ease = inOutCubic) {
  const p = ease(seg(t, t0, t1));
  return { x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), w: lerp(A.w, B.w, p), h: lerp(A.h, B.h, p), r: lerp(A.r, B.r, p) };
}
const logZoom = (z0, z1, p) => z0 * (z1 / z0) ** p;   // a push at constant felt speed
```

## 3. Rhythm in numbers

- **Shot lengths vary 4x or more** (0.25 s words beside 2 s holds). A coefficient of
  variation under 0.25 is a metronome: equal shots read as slides even when each one moves.
- **A quarter of the frames dead still**, and one stretch of 1 s or more with nothing
  moving: no drift, no handheld float, no slow push. Rests are what make the hits land.
- **One burst** (3 or more big changes inside 1.5 s) when the concept has hits. A concept
  built on one continuous move may have none; that is not a flaw.
- Never end two shots the same way in a row (spring out, blur out, hard cut: alternate).
- **Small subject, big ground** for product and UI films: most of the frame is empty, and
  full-bleed is the exception (one calm hold). At key moments the subject still fills a
  third of the frame height.
- **A site background loop breathes and rests.** An 8-10 s hero loop that never stops pulls
  the eye from the H1 and reads as a screensaver: move about 60% of the loop, hold the rest
  (for a breathing wall: inhale 2.5 s, hold 1.5 s, exhale 2.5 s, hold 1.5 s).
```js
const cuts = [0, 1.6, 3.0, 4.8, 7.0, 9.6, 12.1, 13.3, 15];            // from the beat sheet
const len = cuts.slice(1).map((c, i) => c - cuts[i]), mean = len.reduce((a, b) => a + b) / len.length;
const cv = Math.sqrt(len.reduce((a, b) => a + (b - mean) ** 2, 0) / len.length) / mean;   // >= 0.25
```

## 4. Reads: time it for the viewer

You know what happens because you wrote it. The viewer sees it once, at full speed.
- **Write the reads.** For each shot, list in order what the viewer must understand, each
  with a start and an end. Every read needs time to be found, understood and registered.
- **One read at a time.** Two things at once and the viewer sees one. Cause, then reaction,
  in sequence.
- **Fast actions, slow meanings.** Anticipation lets a move be quick; the hold after it lets
  its meaning land. Quick where nothing matters, held where it does.
- **Lead the eye** before an important read: something looks at it, moves first, or lights
  up, and the eye gets time to arrive.
- **The last read gets the longest hold** before the end card or the loop point.
- **On-screen text holds** after it finishes animating in: Latin letters / 15 + 1.5 s; CJK
  characters / 4.5 + 1.5 s; subtitles at least max(1.8 s, the spoken line + 0.6 s); a title
  card at least 4 s. **Hebrew:** letters / 11 + 1.5 s. Hebrew words carry fewer letters and
  silent reading runs about a fifth slower than English in cross-language studies, so the
  Latin rate cuts lines short. Confirm with one timed read at playback speed.
- Make it faster with fewer words per screen, never by cutting before people finish.

**A chat that plays itself** (a phone demo on a site, or a film) is a list of reads. Build
the timeline from the reads instead of checking it after:
```ts
export const holdFor = (text: string) => {
  const n = text.replace(/\s+/g, '').length;
  const rate = /[぀-ヿ一-鿿]/.test(text) ? 4.5 : /[֐-׿]/.test(text) ? 11 : 15;
  return n / rate + 1.5;
};
type Msg = { from: 'in' | 'out'; text?: string; media?: 'photo' | 'video'; read?: number };
export function chatTimeline(msgs: Msg[], start = 0.8) {
  let t = start;
  const items = msgs.map((m) => {
    const typingAt = t;
    const typing = m.from === 'in' ? Math.min(1.6, 0.6 + (m.text?.length ?? 24) * 0.025) : 0.35;   // dots sized to the message
    const showAt = t + typing;
    t = showAt + (m.media ? (m.read ?? 2.2) : holdFor(m.text ?? ''));   // a photo or a clip is a read too
    return { ...m, typingAt, showAt, doneAt: t };
  });
  return { items, end: t + 1.5 };                                      // the last read gets extra before the loop
}
```
A three-message Hebrew thread (a question, a reply, a photo) comes out at about 14.4 s;
that is the honest length. Typing dots start only after the previous bubble's hold. On a
site these times drive class toggles (discrete events); under reduced motion the whole
thread shows at once.

## 5. Acting: motion with weight, as pure functions

Code moves every part at once, on one curve, by one amount; that is what reads as
mechanical. `motion-patterns.md` 4 has jump arcs and squash for letters; these generalise.
- **Anticipation:** a small move the other way before a big one.
- **Squash and stretch keep the volume:** `scale(1/s, s)`.
- **Slow in, slow out:** almost nothing moves at constant speed (marquees and belts aside).
- **Arcs:** living things and thrown things travel on curves.
- **Overlap:** the lead part moves first, the rest follow 40-120 ms later on a softer curve
  and settle last.
- **No twins:** two arms, two eyes or a crowd never share timing; offset by seed.
- **Strong key poses:** each storytelling pose reads as a still before any in-between is
  written. Check them with a low-fps draft (section 9).
- **Stepped drawing, smooth camera:** paper, cel and stop-motion looks draw on twos (12
  drawings a second at 24 fps), but the camera and the light stay on ones: a stepped camera
  reads as lag.
```js
const anticipate = (p, a = 0.18, back = 0.12) =>        // p: 0..1 over the whole move
  p < a ? -back * Math.sin((Math.PI * p) / a) : outBack((p - a) / (1 - a));
const ring = (t, t0, freq = 3, decay = 6) =>             // settle after an event; zero before it, no state
  t < t0 ? 0 : Math.exp(-decay * (t - t0)) * Math.sin(2 * Math.PI * freq * (t - t0));
const onTwos = (t, fps = 24) => Math.floor((t * fps) / 2) * (2 / fps);
const lagOf = (i) => 0.04 + hash(i) * 0.08;              // per-part overlap, seeded
```

## 6. Camera: operated, not mounted

A locked camera over a moving subject reads as a screensaver; a camera that chases what each
beat frames reads as filmed.
- **Every move has a reason**, and a 30 s film uses at least three or four kinds (push, pull,
  track, pan, crane, zoom), plus one signature shot.
- **Follow:** key the camera a beat behind the subject (about 0.1 s) on a sine in-out.
  **Snap:** key where the subject will land, before it gets there, on an expo in-out.
- **A hand:** two slow incommensurate sines, a few px at zoom 1, faded to zero in the holds.
- **Impacts:** a short decaying shake, deterministic, zero before the hit. Never in a
  narrated UI film: with shutter blur, shake doubles every letter.
- **Something to slide against:** on an empty ground a move does not read; draw a faint far
  layer (a dot grid at 3-6% opacity, depth 1-1.5).
- **One world-to-screen function** for everything that follows the subject: irises, labels,
  crops, callouts. Never hand-typed screen coordinates.
```js
const W = 1920, H = 1080;
const KEYS = [                                           // world coordinates of the layout at zoom 1
  { t: 0, x: 960, y: 540, z: 1 },
  { t: 2.2, x: 1240, y: 610, z: 1.9, ease: inOutSine },  // follow
  { t: 3.0, x: 700, y: 520, z: 1.4, ease: inOutExpo },   // snap to where it lands
  { t: 6.0, x: 700, y: 520, z: 1.4 },
];
const HITS = [[3.0, 9, 7]], HOLDS = [[4.2, 5.6]];        // [t, px, decay] shakes; [from, to] dead still
function keyAt(t) {
  if (t <= KEYS[0].t) return KEYS[0];
  const i = KEYS.findIndex((k) => k.t >= t);
  if (i === -1) return KEYS[KEYS.length - 1];
  const a = KEYS[i - 1], b = KEYS[i], p = (b.ease ?? inOutSine)(clamp((t - a.t) / (b.t - a.t)));
  return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: a.z * (b.z / a.z) ** p };   // zoom in log space
}
function camAt(t) {
  const c = keyAt(t);
  const env = HOLDS.reduce((e, [a, b]) => e * (1 - sstep(a - 0.3, a, t) * (1 - sstep(b, b + 0.3, t))), sstep(0, 0.4, t));
  let x = 4 * env * (Math.sin(1.1 * t) + 0.5 * Math.sin(2.7 * t + 0.6));
  let y = 4 * env * (Math.sin(0.8 * t + 1.9) + 0.4 * Math.sin(2.3 * t));
  for (const [th, amp, decay] of HITS) if (t >= th) {
    const e = amp * Math.exp(-decay * (t - th)); x += e * Math.sin(83 * (t - th)); y += e * Math.cos(61 * (t - th));
  }
  return { x: c.x + x / c.z, y: c.y + y / c.z, z: c.z };
}
const camCSS = (c) => `translate(${W / 2}px,${H / 2}px) scale(${c.z}) translate(${-c.x}px,${-c.y}px)`;   // world layer, transform-origin 0 0
const toScreen = (c, x, y) => [(x - c.x) * c.z + W / 2, (y - c.y) * c.z + H / 2];
const layerCSS = (c, d) => {                             // parallax: depth d > 0 is farther and moves less
  const f = 1 / (1 + d), z = 1 + (c.z - 1) * f;
  return `translate(${W / 2}px,${H / 2}px) scale(${z}) translate(${-(W / 2 + (c.x - W / 2) * f)}px,${-(H / 2 + (c.y - H / 2) * f)}px)`;
};
```
Inside a declared hold the camera is still to a hundredth of a pixel (tested). On a site, a scroll film's camera is the same function with
`t` from scroll progress, written through the shared ticker.

## 7. Transitions: one grammar, made of the medium

- **Every seam gets a transition**: into the first shot, between every pair, out of the
  last. Never open on a hard frame and never just stop. Changes inside a shot (a mood, a
  state, a turn) are transitions too: anticipation, then the change, then a settle.
- **Made of the medium, one grammar per film:** a dot wipe for print, a brush wipe for
  paint, UI expanding or collapsing for software, an iris from the subject, ink spreading,
  a page turn. Default fades between unrelated scenes are not a transition.
- An expansion that lands on a beat starts a frame early, so the beat frame is mostly open.
```js
// dot wipe: discs grow on a diagonal delay to full cover at p = .5, the scene switches there, then they shrink
function dotWipe(g, p, { cell = 120, colour = '#14202b', W = 1920, H = 1080, dir = 1 } = {}) {
  if (p <= 0 || p >= 1) return;
  const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, R = cell * Math.SQRT1_2 * 1.02;  // R covers the cell's half diagonal
  g.fillStyle = colour; g.beginPath();
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const d = (0.25 * ((dir === 1 ? c : cols - 1 - c) + r)) / (cols + rows - 2);   // dir = -1 in RTL
    const s = p <= 0.5 ? clamp((p - d) / 0.25) : 1 - clamp((p - 0.5 - d) / 0.25);
    if (s <= 0) continue;
    const rad = R * (1 - (1 - s) ** 2);
    g.moveTo(c * cell + rad, r * cell); g.arc(c * cell, r * cell, rad, 0, Math.PI * 2);
  }
  g.fill();
}
```
Draw scene A while `p < 0.5` and scene B after; tested to full cover on the switch frame. A
radius short of the half diagonal shows the hard switch through the gaps.

## 8. Shutter blur for fast moves (free, ffmpeg)

A screenshot is an instant, so anything that travels more than roughly 60-80 px per output
frame strobes into sharp copies; CSS `blur()` is not a fix (it blurs across the motion too).
A real shutter averages the frames inside its open time. Render subframes and average them:
```bash
# S samples inside a 180-degree shutter at 30 fps: render at 30 * 2S fps, average S, keep the first window of each frame
S=4; N=$((2*S))
node scripts/render-video.mjs comp.html out/sub.mp4 --size 1920x1080 --fps $((30*N))
ffmpeg -i out/sub.mp4 -vf "tmix=frames=$S,select='eq(mod(n\,$N)\,$((S-1)))',setpts=N/30/TB" -r 30 \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart out/film.mp4
```
- Frame k averages subframes 8k to 8k+3: the shutter opens on the frame time and closes
  half a frame later. A box at 56 px per frame smears 28 px instead of jumping (tested).
- Samples: about one per 12 px of travel per frame (S = 4 to 8). Cost is N times the render:
  a 15 s film at S = 4 is 3,600 subframes, roughly 15 minutes. Drafts render without it;
  the final only.
- Put hard cuts on exact frame times (multiples of 1/30 s) so no frame averages across one.
- Add audio after (`--audio` on the full render does not apply here; mux with ffmpeg
  `-i out/film.mp4 -i mix.wav -c:v copy -c:a aac -shortest`).

## 9. Sound

- **Write a sound table** per section: the ambience bed, the main foley, the music state.
- **Every visible action has a sound** in its material (paper, glass, water, metal), but in
  dense passages fewer sounds than events, in one family and one room (one reverb). A beep
  per event is the audio slideshow.
- **Two silences** (or near-silences) before the turn; the first sound after one is among
  the most important in the film.
- **Sound as a transition twice:** the next scene's sound arrives early, or the last
  scene's runs over the cut.
- Duck the music about 8-11 dB under a voice and under key foley. Social films master to
  -14 LUFS with true peak at or under -1 dBTP:
  `ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 mix-14.wav`.
- Keep cue times in one `timeline.js` that the composition and the mix both import, so a
  hit and its sound cannot drift.
- Sources are CC0 or CC BY, or the client's own, each with its source and licence in the
  project's CREDITS. No sound from a library whose licence forbids redistribution, and no
  copyrighted track unless the client supplies it and says so.

## 10. Review: strips, crops and drafts

Motion cannot be seen by reading code. The contact sheet in `opus-videos.md` shows the shape
of the film; these show what moves:
```bash
node scripts/render-video.mjs comp.html out/draft.mp4 --size 960x540 --fps 6           # key poses and reads, fast
ffmpeg -ss 2.1 -t 0.6 -i out/film.mp4 -vf "scale=320:-1,tile=6x3" -frames:v 1 out/strip.png      # every frame of one moment
ffmpeg -ss 2.4 -i out/film.mp4 -vf "crop=500:400:760:420" -frames:v 1 out/crop.png              # full-size detail: a face, a hand, type
ffmpeg -i out/film.mp4 -vf blackdetect=d=0.05:pix_th=0.05 -an -f null - 2>&1 | grep black_start   # empty = no blank frames
```
- A strip for every carry, every hit and every seam; a crop for every face or line that
  carries the story.
- Read the draft like a viewer: at each frame, where is the eye, and has the last read
  landed? Count frames per read (24 frames is one second).
- Look for: a piece popping between two frames, parts moving all at once, a constant speed,
  two elements in sync, a contact that does not touch, a still element that jitters.
- Watch the final once at full speed with sound.

## 11. Template tells in a film

Any two of these and the film reads as generated:
- beats that replace each other (`display` swaps, fades between unrelated scenes);
- equal shot lengths, a frame that never rests, a camera that never stops;
- particle bursts, confetti and sparkles that are not the product's own behaviour;
- text that repeats the picture (a "LEAK FOUND" label over a picture of the leak);
- states or faces that snap, linear moves, parts that move together, twins in sync;
- a tiny subject in a big empty frame for the whole film;
- the last film's look, camera grammar and transitions, reused.
