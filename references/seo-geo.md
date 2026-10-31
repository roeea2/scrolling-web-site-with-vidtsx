# SEO, GEO and agent readiness: what to bake in while building

Distilled from claude-seo by AgriciDaniel (MIT), https://github.com/AgriciDaniel/claude-seo
(v2.5.0, facts as that repo checked them through 2026-10-22). A bracket like `[seo-geo]`
names the claude-seo file behind a claim; a URL is the primary source that file cites.
"(verified)" means the primary source was re-read on 2026-10-31. Re-check any dated fact
older than 60 days. Not repeated here: JSON-LD and the launch checklist (`seo-schema.md`),
OG card and image budgets (`asset-pipeline.md`), frame-time jank (`perf-playbook.md`).

**Free only.** Every tool here costs nothing: Search Console, Bing Webmaster Tools,
IndexNow, PageSpeed Insights (web UI, or the PSI and CrUX APIs with a free Google Cloud
key), CrUX Vis, Rich Results Test, validator.schema.org, local Lighthouse and Chrome. Where
only a paid tool gives a signal (rank tracking, keyword volumes, backlink indexes,
AI-mention trackers), this skill skips that signal. Nothing that costs money goes on a site.

## 0. When to run the full claude-seo audits

Its fetchers audit a live URL and refuse localhost unless the host is listed in
`CLAUDE_SEO_LOCAL_TARGETS` [seo-technical]. If installed, run it once the domain is live:

- Launch week: `/seo technical`, `/seo schema`, `/seo images` on home + one service page;
  `/seo local` for a local business (skip its DataForSEO and `seo-maps` paths).
- "Will ChatGPT find us?": `/seo geo`, then `/seo agentic`.
- Once CrUX has field data: `/seo google` with a free key (PSI, CrUX, `lcp_subparts.py`).
- Quarterly: `/seo drift baseline`, later `/seo drift compare`.

Skip `/seo dataforseo`, `/seo maps`, `/seo backlinks`, the paid extensions (Ahrefs, SE
Ranking, Profound, Moz, Firecrawl, Keywords Everywhere), `keyword_planner.py` (Google Ads
account) and `nlp_analyze.py` (GCP billing). Its 0-100 scores are heuristics: third-party
tools have no access to Google's ranking data
(https://developers.google.com/search/docs/fundamentals/third-party-seo).

## 1. Technical foundations for a prerendered SPA

1. **Everything Google needs is in the prerendered HTML:** title, description, canonical,
   robots meta, JSON-LD, the h1, the copy. Google's JS SEO doc (Dec 2025): if raw and
   rendered canonicals differ it may use either; a raw `noindex` may stick even if JS
   removes it; no JS runs on non-200 pages [seo-technical §8]. Many AI fetchers run no JS
   (GPTBot, PerplexityBot in public tests) [seo-geo §5]. claude-seo fails a page under 50
   visible words with an empty root div [agentic_check.py `server-rendered`].
2. **One head per route:** each prerendered route writes its own title, description,
   canonical and `og:url`. One shared head for every route is duplicate metadata.
3. **Title** unique, service + place first, brand last; claude-seo's 30-60 characters
   [seo/references/quality-gates.md] is a heuristic, as Google cuts by display width.
   **Description** 120-160 characters for this page, never opening with the title or
   closing on a stock CTA, the templated shape [seo-page, scripts/metadata_template.py].
4. **One h1** naming the service and the place; h2-h6 with no skipped levels [seo-page].
   No word-count target: Google says there is none, so claude-seo's table (homepage 500,
   service page 800 words) [quality-gates.md] is a smell test, not a rule.
5. **Canonical** absolute, https, self-referencing on indexable pages; never `noindex` plus
   a canonical elsewhere; a fix can take up to two weeks to settle [seo-technical §2].
6. **noindex pages** (campaign landings, demos): noindex in the raw HTML, out of the
   sitemap, NOT disallowed in robots.txt: a blocked crawler never reads the noindex
   (https://developers.google.com/search/docs/crawling-indexing/block-indexing).
7. **Snippet controls reach AI answers.** AI Overviews and AI Mode use only indexed,
   snippet-eligible pages (verified, AI optimization guide): `nosnippet` or
   `max-snippet:0` drops the page from them, `data-nosnippet` drops one passage.
8. **Real links:** every page reachable through a crawlable `<a href>`, within 3 clicks of
   home [seo-technical §1]. A route reachable only through an onClick does not exist.
9. **Real 404s.** A catch-all rewrite (`/(.*) -> /index.html`) makes every typo a soft 404
   and makes `/llms.txt` and `/.well-known/*` answer HTML with 200, which Lighthouse counts
   as failures [agentic_check.py `http-404`]. Prerendered sites do not need it: drop it,
   ship a static `404.html`, prove `curl -sI https://<site>/nope` prints 404.
10. **Redirects** one hop, 301 or 308; one trailing-slash style everywhere [seo-technical
    §4]. Googlebot reads only the first 2 MB of HTML [§1]: no base64 images in markup.
11. **Same content at every viewport:** mobile-first indexing reads the phone layout, and
    answers hidden in tabs or accordions qualify less [seo-technical §5].
12. **Never `pushState` on scroll.** A hash sync that pushes history makes Back walk
    through sections instead of leaving: the trap Google's back-button-hijacking spam
    policy targets (2026-04-13, enforced since 2026-06-15) [seo-technical §3,
    https://developers.google.com/search/blog/2026/04/back-button-hijacking]. Use `replaceState`.
13. **Bilingual:** one language per URL (`/` Hebrew, `/en/` English), never a JS toggle.
    Each version lists hreflang for all versions including itself plus `x-default`, with
    return links, on canonical URLs only [seo-hreflang §1-6]. Codes: `he` (not `iw`),
    `en`; `he-IL` is optional, a region alone is invalid.

## 2. Core Web Vitals: the budget and how this stack hits it

| Metric | Good | Poor |
|---|---|---|
| LCP | <= 2.5 s | > 4.0 s |
| INP (replaced FID 2024-03-12; never cite FID) | <= 200 ms | > 500 ms |
| CLS | <= 0.1 | > 0.25 |

Judged at the 75th percentile of real Chrome users, per page and per origin
[seo/references/cwv-thresholds.md, https://web.dev/articles/vitals]; a tiebreaker, not a
trump card. The thresholds have not changed: "CWV 2.0", "VSI" and a 2.0 s LCP are blog
inventions [cwv-thresholds.md]. A new small business has no CrUX data, so the lab is all
you have: `scripts/verify.mjs` under phone throttling, plus local Lighthouse. A Lighthouse
page load cannot measure INP; its proxy is Total Blocking Time.

### LCP: fix the subpart that dominates

LCP = TTFB + resource load delay + resource load duration + element render delay; CrUX has
reported all four since 2025-02-11 [cwv-thresholds.md]. Target split: ~40% TTFB, <10% load
delay, ~40% load duration, <10% render delay (verified, https://web.dev/articles/optimize-lcp).
claude-seo calls a subpart dominant at 40% of LCP or more [scripts/lcp_subparts.py].

| Dominant | On this stack it means | Fix |
|---|---|---|
| TTFB (good < 800 ms) | uncached HTML, a serverless render | static prerendered HTML from the CDN |
| Load delay | hero found late: CSS background, JS-mounted, lazy | `<img>` in the markup, or `<link rel="preload" as="image" imagesrcset imagesizes fetchpriority="high">` |
| Load duration | hero too heavy | AVIF/WebP, `srcset` + true `sizes`, aim < 200 KB |
| Render delay | the hero paints late on purpose | the laws below |

Render delay is this skill's signature failure: the bytes arrived, but the h1 starts at
opacity 0 for an entrance, a loader covers the page, the hero mounts after hydration, or
`font-display: block` holds the text.
- Hero text and image paint from HTML + CSS alone, before any JS. Animate the decorations
  around the h1, never its first paint (`magicui.md` law 1).
- `fetchpriority="high"` on the one LCP image (on more than one or two it stops helping:
  web.dev); never `loading="lazy"` on it [seo-images]. A video hero's `poster` is the LCP
  candidate: preload it. Pixels, chat and analytics load after the page [cwv-thresholds.md].

### Fonts: fast, and no shift

- `display=swap` (`rtl-hebrew.md`) trades invisible text for a shift when the face lands:
  claude-seo's "swap + preload" fixes LCP, not CLS [cwv-thresholds.md]. Kill the shift with
  a metric-matched `local()` fallback (`size-adjust`, `ascent-override`, `descent-override`:
  https://web.dev/articles/css-size-adjust), or `font-display: optional` for body text.
- Preload only the self-hosted woff2 the h1 uses (`as="font" type="font/woff2" crossorigin`).

### INP: every tap paints within 200 ms

Causes on animated sites [cwv-thresholds.md, agents/seo-performance.md]: tasks over 50 ms,
hydrating a big tree while the visitor taps, heavy pointer handlers (tilt, spotlight,
magnetic), DOM over ~1,500 elements, third-party scripts.
- Pointer and scroll handlers only store a number or set a CSS variable; one rAF loop does
  the work (`perf-playbook.md`). CTAs answer in CSS (`:active`) before any JS. A click
  handler with real work yields first (`scheduler.yield()`, else `setTimeout(0)`).
- The jank probe measures frame time, not INP. They correlate; they are not the same.

### CLS: reserve every box [seo-images, cwv-thresholds.md, `magicui.md` laws 2-3]

- `width` + `height` (or `aspect-ratio`) on every `<img>`, `<video>`, `<iframe>`, canvas
  wrapper and 3D stage; heroes get a `min-height`. JS-filled tracks (marquees, tickers,
  counters) get their final size in CSS first. Late UI (cookie bar, chat bubble) overlays
  with `position: fixed`. Lighthouse's Agentic Browsing category counts CLS too.

**Multi-page sites only:** keep bfcache alive (no `unload` listeners, no `Cache-Control:
no-store` on HTML) [scripts/preload_check.py]; speculation rules with `"eagerness":
"moderate"` prerender the next page on hover in Chrome (a pixel waits for `document.prerendering`).
Free measurement: local Lighthouse (13.x needs Node 22.19+), PageSpeed Insights, Search
Console's CWV report; with traffic, the CrUX API or CrUX Vis [agents/seo-performance.md].

## 3. GEO: being the passage an AI answer cites

### What Google says (verified, page last updated 2026-07-10)

https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
[seo-geo/references/google-ai-optimization-guide.md]:
- Optimizing for generative AI search is "still SEO". AI Overviews and AI Mode retrieve
  from the normal index and fan one query out into sub-queries.
- Eligibility: indexed, snippet-eligible, and included in Search Console's "Search
  generative AI" control (Include is the default; not a ranking signal, not a training
  control: verified, https://support.google.com/webmasters/answer/16908024).
- Not needed: llms.txt or AI text files, Markdown copies, chunking, special schema. What
  wins: unique, first-hand content. Spam policies cover AI answers too [google-updates.json].

Other engines keep their own index (OAI-SearchBot and Bing for ChatGPT, Claude-SearchBot,
PerplexityBot) [seo-geo]: hence the crawler table below.

### Passage laws (third-party heuristics, not engine rules) [seo-geo §1-4]

1. **Answer first.** A section's first 40-60 words answer its heading outright, under a
   question heading in the words people type: "כמה זמן לוקח ...?", "מה ההבדל בין ...?".
2. **Self-contained passages** that make sense lifted out alone: name the subject, never
   "as mentioned above". The 130-170 word block is a third-party heuristic; Google says
   chunking is not required.
3. **Specific, true, client-confirmed facts:** numbers, areas, timings, license numbers;
   "X is ..." definitions; lists for steps, tables for comparisons, 2-4 sentence paragraphs.
4. **First-hand beats commodity** (Google's own example: a "7 tips" listicle vs a lived
   story). For a local business: real jobs, places, dates, prices charged, the method.
5. **Freshness means real updates:** Google lists faked dates as a warning sign. ("Under 3
   months, ~3x more citations" is an SE Ranking figure claude-seo cites, unverified.)
6. **Answer above the film.** claude-seo cites ~44% of AI citations coming from the first
   30% of a page (SE Ranking). The answer and the offer come before a long cinematic scroll.

### Entity and brand signals for a local business

- One name, phone and area everywhere (`seo-schema.md` law 2); `sameAs` only to real
  profiles. Bing Places is free and, per claude-seo, feeds ChatGPT and Copilot: ChatGPT
  reads the Bing index and directories, not the Business Profile [seo-local,
  local-search-behavior.md, third-party study].
- Brand mentions correlate with AI visibility about 3x more than backlinks (Ahrefs, 75,000
  brands, 2025-12) [seo-geo]: earned by real work (local press, suppliers, community
  groups, YouTube clips of jobs), never bought.
- US citation lists (Yelp, BBB, paid aggregators) do not apply in Israel: match NAP on the
  directories the client already uses, e.g. easy.co.il, B144, d.co.il (skill note).

### AI crawlers: the real user agents and what each controls

[seo-geo crawler table; seo-agentic/references/access-policy.md; Google-Extended verified
on https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers]

| Token | Controls | Obeys robots.txt |
|---|---|---|
| Googlebot | Google Search, AI Overviews, AI Mode | yes |
| Google-Extended | Gemini training and grounding; a token, not a crawler; no Search effect | yes |
| Bingbot | Bing and Copilot; Bing also feeds ChatGPT search | yes |
| OAI-SearchBot / GPTBot | ChatGPT search citations / OpenAI training only | yes |
| Claude-SearchBot / ClaudeBot | Claude search citations / Anthropic training only | yes |
| PerplexityBot | Perplexity search index | yes |
| Applebot / Applebot-Extended | Siri, Spotlight, Safari / Apple training opt-out | yes |
| CCBot | Common Crawl dataset, widely used for training | yes |
| Google-Agent, ChatGPT-User, Claude-User, Perplexity-User | fetches a person asked for | Claude-User yes; ChatGPT-User "may not apply"; the others generally no |

- Blocking GPTBot, ClaudeBot or Google-Extended removes nothing from search or AI answers;
  blocking OAI-SearchBot, Claude-SearchBot or PerplexityBot removes the site from that
  engine's answers. Default: allow everything. A training opt-out is the client's business
  decision: ask, never decide it for them [access-policy.md].
- RFC 9309: a crawler named in a group ignores `*` entirely. A 5xx robots.txt means "all
  disallowed", a 4xx "no rules": ship static text, never the SPA's HTML. Never IP-block AI
  crawlers: then they cannot read robots.txt at all [access-policy.md].
- `Content-Signal: ... ai-train=no` is a Cloudflare policy line whose IETF draft expired
  2026-04-04; Google does not act on it [access-policy.md]. Skip.

```
User-agent: *
Allow: /

Sitemap: https://example.co.il/sitemap.xml

# Only with a client-chosen training opt-out:
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Disallow: /
```

### llms.txt: the honest verdict

Evidence [seo-geo/references/llmstxt-evidence.md]: Google says AI text files "neither harm
nor help" visibility "as Google Search ignores them" (verified). Mueller called the
discovery use case "a dead end"; Illyes said Google has no plans to support it (2025). SE
Ranking, 300,000 domains (2025-11): 1 of the 50 most AI-cited domains had one. OtterlyAI
logs: 84 of 62,100 AI-bot requests (0.1%) asked for it. No major AI search provider says it
reads third-party llms.txt files; coding agents read them for library docs. Lighthouse's
Agentic Browsing category scores it when present: a lab audit, not a search signal.

**Verdict:** not a citation lever, never sold or promised as AI SEO. Skip it on
local-business sites. Ship it on developer or portfolio sites whose docs agents read, or
when the client wants it counted in Lighthouse; then it passes Lighthouse's rules (an
`# H1`, one `[text](url)` link, 50+ characters) and the host 404s unknown paths.

**Measuring AI visibility for free:** Search Console's generative AI report (AI Overviews
and AI Mode impressions only, worldwide since 2026-08-31) [data/google-updates.json];
analytics referrers (chatgpt.com, perplexity.ai, copilot.microsoft.com, gemini.google.com,
claude.ai); and by hand, monthly, the client's three money questions asked to each engine.

## 4. Agent readiness

Agents (ChatGPT's browser, Gemini in Chrome, Claude in Chrome, Comet) read the
accessibility tree, the DOM and screenshots; vendors agree on the tree [agent-friendly-pages.md].
Readiness = accessibility + performance + access policy [seo-agentic].

**Lighthouse "Agentic Browsing"** (13.x, still labelled under development) reports a
fraction X/N, never a percentage [lighthouse-agentic-category.md, checked against 13.5.0].
`agent-accessibility-tree` passes only if none of 33 axe rules fail (button-name,
link-name, label, select-name, input-button-name, aria-hidden-focus, the aria-* validity
rules, duplicate-id-aria, tabindex, svg-img-alt, document-title, ...; not contrast, heading
order or landmarks). `cumulative-layout-shift` is lab CLS. `llms-txt`, the two WebMCP
audits and `ard-schema` count only when present. A plain site is scored on 2: get 2/2; a
higher N is not a better site. Free: `npx lighthouse@latest <url> --only-categories=agentic-browsing`.

### What to build in (the whole job for a small business)

1. Native controls: `<button>` for actions, `<a href>` for navigation, `<label for>` on
   every input. A clickable `<div>` reaches the tree with no role and agents skip it.
2. An accessible name on every icon-only control: WhatsApp, phone, menu, close.
3. Nothing focusable inside `aria-hidden`. A marquee's duplicate track that repeats links
   fails `aria-hidden-focus`: make the duplicate `inert`, or render it without links.
4. Targets at least 24x24 CSS px (WCAG 2.2 AA) [agent-friendly-pages.md].
5. No invisible layer over a control: decorative canvases, beams, grain and spotlight
   layers get `pointer-events: none`; a card-wide click overlay never covers inner links.
   `cursor: pointer` only on real controls.
6. Confirmations stay on screen (a success panel, the receipt printer), not a 2 s toast.
7. No hover-only menus, focus traps or CAPTCHAs on content pages. A 3D or canvas scene
   keeps its words in the DOM. Hold and drag interactions have a click or input fallback.

These are practitioner consensus with no controlled study behind them
[agent-friendly-pages.md], and plain accessibility, which is reason enough.

**WebMCP: skip it for now.** Page-registered tools (`document.modelContext.registerTool`),
as checked on 2026-09-23 [seo-agentic/references/webmcp.md, vendor-matrix.md]: a W3C
Community Group draft off the standards track; a Chrome origin trial (M149 to M156), no
ship date; WebKit opposes, Mozilla is neutral; the only default consumer is ChatGPT
desktop's browser. Revisit only for a real booking form: one imperative tool through the
form's own handler, `consequentialHint`, human confirmation kept. Never quote WebMCP
"token efficiency" figures: they trace to marketing posts.

**Skip unless you run the service:** `ai-catalog.json` (ARD), `/.well-known/*` API and
OAuth documents, A2A and MCP server cards, UCP, Markdown copies or `Accept: text/markdown`
negotiation (no consumer agent is confirmed to send it), Web Bot Auth [discovery-and-markdown.md].

## 5. Images: deltas to asset-pipeline.md [seo-images]

- `alt` on every `<img>`: the subject, in the site's language, roughly 10-125 characters;
  decorative images get `alt=""` (empty, never missing). No filenames or keyword lists.
- `<picture>`: AVIF, then WebP, then JPEG (support about 95% and 97%, caniuse 2026-09-28);
  the OG card stays JPEG. `srcset` + a `sizes` that matches the layout; `decoding="async"`
  on non-LCP images; `loading="lazy"` below the fold only.
- Targets: content < 100 KB (warn > 200, critical > 500), hero < 200 KB (warn > 300,
  critical > 700). Aim for these; the `asset-pipeline.md` caps still apply.
- Anything that matters is an `<img>`, not a CSS background: Google does not index CSS
  images, and a background is discovered late (LCP load delay).
- Hyphenated descriptive filenames (`hachlafat-luach-rehovot.avif`): claude-seo says HIGH
  ranking factor, Google says a light clue. IPTC fields only change Google Images display:
  skip them, and keep the exposure gate stripping EXIF and GPS.
- Visual search (Lens, Circle to Search, AI Mode) reads scenes and objects: real photos of
  real jobs in recognisable places are the lever. AI images never stand in for "our work".

## 6. Local SEO: deltas to seo-schema.md [seo-local, seo/references/local-schema-types.md]

1. **NAP as visible text on every page** (footer, contact), identical to the JSON-LD and
   the Business Profile. Phone as `<a href="tel:+972500000000">`, shown in local format in
   `<span dir="ltr">` (`rtl-hebrew.md`); WhatsApp as `https://wa.me/972500000000`.
2. **A section or page per core service:** the #1 local organic factor and #2 for AI
   visibility in Whitespark's 2026 survey (industry survey, not Google). One-page site: an
   `id` section and question h2 per service. Three or more distinct services: a route each.
3. **City pages pass the swap test** (if swapping the city name leaves the page true, it is
   a doorway page; claude-seo warns at 30+ and stops at 50+ [seo/SKILL.md]). Prefer
   `areaServed` plus one section of real jobs per city.
4. **Storefronts:** `geo` with at least 5 decimal places, real hours on the page and in
   `openingHoursSpecification`. An embedded map is not a ranking factor and is heavy: use
   "Navigate" links (Google Maps, Waze) or a click-to-load facade.
5. **Answer questions on the site:** Google discontinued the Business Profile Q&A API on
   2025-11-03 and is reportedly phasing public Q&A out.
6. **Reviews:** never gate them (screening satisfaction first breaks Google's
   fake-engagement policy); no fake or undisclosed incentivized reviews on the page or in
   markup (review snippet guideline, 2026-07-24) [data/google-updates.json].
7. **Free listings at launch, same NAP:** Google Business Profile, Bing Places, Apple's
   business listing. Skip paid aggregators and paid "citation building".

## 7. Schema reality check: what still earns a rich result

Never promise a rich result the markup cannot earn. Schema is no direct ranking factor
(Mueller, via seo-local), AI features need none (verified); it still helps machines parse.

| Type | Google rich result today | Source |
|---|---|---|
| FAQPage | **None for any site since 2026-05-07** (gov/health only since 2023-08) | verified: https://developers.google.com/search/updates |
| HowTo | None since 2023-09 | https://developers.google.com/search/blog/2023/08/howto-faq-changes |
| ClaimReview, EstimatedSalary, LearningVideo, Course Info, VehicleListing, SpecialAnnouncement | Retired 2025-06 / 2025-07 | https://developers.google.com/search/blog/2025/06/simplifying-search-results |
| Practice Problem | Retired 2026-01 | [seo/references/schema-types.md] |
| WebSite SearchAction | No sitelinks search box; machine-readable only | [schema-types.md] |
| BreadcrumbList | Desktop only since 2025-01-22 | [schema-types.md] |
| Event | Only public, bookable events at a physical place (since 2025-06-05) | [schema-types.md] |
| Review, AggregateRating | Only real reviews shown on the page | [schema-types.md] |
| LocalBusiness, Organization, VideoObject, ProfilePage, Article, Product | Live | [schema-types.md] |

- `seo-schema.md` law 5 (FAQPage from the visible FAQ) stands: accurate, free, readable by
  other consumers. Never promise FAQ results in Google or an AI-citation benefit
  (unconfirmed). `QAPage` only where users submit answers. No HowTo: use an ordered list.
- `Attorney` is deprecated in schema.org: use `LegalService` (+ `Person`).
- A site embedding its brand film adds a `VideoObject` (name, description, thumbnailUrl,
  uploadDate, duration, contentUrl or embedUrl; `creator` recommended since 2026-09-24)
  [schema/templates.json]. Portfolio and about pages: `ProfilePage` with a `Person`.
- The Rich Results Test only knows live Google features; validator.schema.org covers the
  rest [seo-schema/references/deprecated-types-2024-2026.md].

## 8. Ship checklist

- [ ] JS disabled: h1, copy, title, description, canonical, robots, JSON-LD all present;
      every route has its own; one h1; `lang` + `dir`; full hreflang set if bilingual.
- [ ] Indexable pages: self canonical, no `nosnippet`. noindex pages: noindex in raw HTML,
      out of the sitemap, not disallowed in robots.txt.
- [ ] robots.txt is static text, admits search and AI search crawlers, has the Sitemap
      line; a training opt-out only if the client chose one.
- [ ] Unknown paths return 404 on the deployed host; no catch-all rewrite.
- [ ] Throttled phone lab: LCP <= 2.5 s, CLS <= 0.1; LCP image in the HTML, high priority,
      never lazy; render delay not dominant. Fonts: metric-matched fallback.
- [ ] Every image: alt attribute, dimensions, lazy below the fold, in budget. Every control
      named; nothing focusable inside aria-hidden; hash sync uses `replaceState`.
- [ ] NAP text, the `tel:` link and the JSON-LD telephone match digit for digit.
- [ ] Each service: an answer-first section under a question h2, client-confirmed facts.
- [ ] After launch: Search Console (generative AI control left on Include), Bing Webmaster
      Tools, Bing Places, IndexNow, Lighthouse agentic 2/2.
