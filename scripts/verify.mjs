#!/usr/bin/env node
// verify.mjs - the full verification sweep for a built site.
// Usage:
//   1. Build and serve the site locally (e.g. python3 -m http.server 5199 -d dist)
//   2. node scripts/verify.mjs http://localhost:5199 [outdir]
//
// Checks, per viewport (390x844, 768x1024, 1024x768, 1440x900, 1920x1080):
//   - horizontal overflow at 0/30/75/95% scroll depth, BOTH edges (RTL-safe)
//   - fixed/sticky chrome collisions at the smallest viewport
//   - screenshots to outdir (default ./shots): every major section at phone
//     and laptop, named in scroll order, plus a mid-scrub frame for any
//     pinned scene taller than 1.5 viewports; top/mid only at the other
//     three viewports, which are there to catch layout breakage
// Plus, at 1440x900:
//   - a jank probe: rAF deltas during a scroll sweep, p95/max
//   - in-page anchors clear fixed/sticky chrome (needs scroll-padding-top)
//   - a heading text dump, so split/masked type missing its spaces is visible
//     (that defect renders perfectly and screenshots cannot catch it)
// Plus SEO, GEO and performance (references/seo-geo.md):
//   - the raw HTML, before JavaScript: what AI crawlers actually receive
//   - title, description, one h1, lang/dir, image alt and dimensions, hydration
//   - robots.txt, AI crawler access and the sitemap (skipped on noindex pages)
//   - a throttled mobile lab load: LCP (and whether its image is prioritised),
//     CLS, and page weight by type
// Exit code 1 on any failure; WARN lines never fail the build.
// Requires: npm i puppeteer-core, a local Chrome.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TARGET = process.argv[2];
const OUT = process.argv[3] || "./shots";
if (!TARGET) { console.error("usage: node verify.mjs <url> [outdir]"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

let puppeteer, NETWORK;
try {
  ({ default: puppeteer, PredefinedNetworkConditions: NETWORK } = await import("puppeteer-core"));
} catch {
  console.error("missing dependency: puppeteer-core.\nrun once: cd " +
    path.dirname(fileURLToPath(import.meta.url)) + " && npm install");
  process.exit(2);
}

const CHROME_CANDIDATES = {
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
  win32: [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  ],
  linux: ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
};
const chromePath = process.env.CHROME_PATH ||
  (CHROME_CANDIDATES[os.platform()] || []).find((p) => fs.existsSync(p));
if (!chromePath) { console.error("Chrome not found. Set CHROME_PATH."); process.exit(2); }

const VIEWPORTS = [
  [390, 844, "phone"],
  [768, 1024, "tablet"],
  [1024, 768, "tablet-l"],
  [1440, 900, "laptop"],
  [1920, 1080, "desktop"],
];
const DEPTHS = [0, 0.3, 0.75, 0.95];

const browser = await puppeteer.launch({ executablePath: chromePath, headless: "new" });
let failures = 0;

// Measures horizontal scrollability in a direction-agnostic way (RTL-safe):
// clamps reveal the true min/max scrollLeft, which is negative in RTL.
const overflowProbe = `(() => {
  const se = document.scrollingElement || document.documentElement;
  const prev = se.scrollLeft;
  se.scrollLeft = -999999; const minL = se.scrollLeft;
  se.scrollLeft = 999999; const maxL = se.scrollLeft;
  se.scrollLeft = prev;
  return Math.round(maxL - minL);
})()`;

for (const [w, h, name] of VIEWPORTS) {
  const page = await browser.newPage();
  // phones and tablets get a real touch context: without it (hover: none) never
  // matches and the shots show the desktop branch of every hover, scrub or lens effect
  await page.setViewport({ width: w, height: h, isMobile: w < 1024, hasTouch: w < 1024 });
  await page.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });
  await page
    .waitForFunction("window.__ready === true", { timeout: 12000 })
    .catch(() => console.log(`warn: __ready never fired @${name}, continuing`));
  await new Promise((r) => setTimeout(r, 1200));

  const max = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  let worst = 0;
  for (const d of DEPTHS) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * d));
    await new Promise((r) => setTimeout(r, 500));
    const ov = await page.evaluate(overflowProbe);
    if (ov > worst) worst = ov;
  }
  const ok = worst <= 0;
  if (!ok) failures++;
  let culprits = "";
  if (!ok) {
    const list = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth, out = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || (r.right <= vw + 1 && r.left >= -1)) continue;
        // report the outermost offender, not every child inside it
        if (el.parentElement && (() => { const p = el.parentElement.getBoundingClientRect(); return p.right > vw + 1 || p.left < -1; })()) continue;
        out.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${typeof el.className === "string" && el.className ? "." + el.className.split(/\s+/)[0] : ""}`);
        if (out.length >= 5) break;
      }
      return out;
    });
    if (list.length) culprits = ` (${list.join(", ")})`;
  }
  console.log(`${ok ? "PASS" : "FAIL"} overflow @${name} (${w}x${h}): ${worst}px${culprits}`);

  if (name === "phone") {
    const collisions = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight;
      const els = [...document.querySelectorAll("*")].filter((e) => {
        const s = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        const isChrome = (s.position === "fixed" || s.position === "sticky") &&
          r.width > 8 && r.height > 8 && s.visibility !== "hidden" && +s.opacity > 0.05;
        // full-viewport sticky scenes (pinned scroll sections) are not chrome
        const coversViewport = r.width >= vw * 0.9 && r.height >= vh * 0.6;
        return isChrome && !coversViewport;
      });
      const out = [];
      for (let i = 0; i < els.length; i++)
        for (let j = i + 1; j < els.length; j++) {
          const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect();
          const ox = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const oy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          if (ox * oy > 16)
            out.push(`${els[i].className || els[i].tagName} x ${els[j].className || els[j].tagName}`);
        }
      return out.slice(0, 5);
    });
    const cOk = collisions.length === 0;
    if (!cOk) failures++;
    console.log(`${cOk ? "PASS" : "FAIL"} chrome collisions @phone: ${collisions.join("; ") || "none"}`);
  }

  // Phone and laptop get a shot of EVERY major section, because that is what
  // actually gets reviewed. Two shots of a 9000px scroll page is not a review.
  // The other viewports exist to catch layout breakage, so top/mid is enough.
  if (name === "phone" || name === "laptop") {
    const stops = await page.evaluate(() => {
      const cand = [...document.querySelectorAll("section, header, footer, main > div")];
      const top = cand.filter((e) => !cand.some((o) => o !== e && o.contains(e)));
      const out = [];
      top.forEach((e, i) => {
        const r = e.getBoundingClientRect();
        if (r.height < 80) return;
        const label = (e.id || String(e.className || "").split(/\s+/)[0] || e.tagName.toLowerCase())
          .replace(/[^a-z0-9_-]/gi, "").slice(0, 18) || `s${i}`;
        const y = Math.round(r.top + window.scrollY);
        out.push({ label, y });
        // a pinned/sticky scene is taller than the viewport and its interesting
        // frame is mid-scrub, not at its top edge
        if (r.height > window.innerHeight * 1.5)
          out.push({ label: label + "-mid", y: y + Math.round(r.height / 2) });
      });
      return out.slice(0, 12);
    });

    let n = 0;
    for (const s of stops) {
      await page.evaluate((y) => window.scrollTo(0, y), s.y);
      await new Promise((r) => setTimeout(r, 700));
      const file = `${name}-${String(++n).padStart(2, "0")}-${s.label}.jpg`;
      await page.screenshot({ path: path.join(OUT, file), type: "jpeg", quality: 82 });
    }
    console.log(`     ${n} section shots @${name}: ${stops.map((s) => s.label).join(", ")}`);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT, `${name}-top.jpg`), type: "jpeg", quality: 82 });
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.5));
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT, `${name}-mid.jpg`), type: "jpeg", quality: 82 });
  }
  await page.close();
}

// Jank probe: rAF deltas during a scroll sweep. Judge p95/max, never avg fps.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });
  await page
    .waitForFunction("window.__ready === true", { timeout: 12000 })
    .catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));
  const jank = await page.evaluate(
    () =>
      new Promise((res) => {
        const deltas = [];
        let last = performance.now(), n = 0;
        const step = (t) => {
          deltas.push(t - last); last = t;
          if (++n < 120) requestAnimationFrame(step);
          else {
            deltas.sort((a, b) => a - b);
            res({
              p95: +deltas[Math.floor(deltas.length * 0.95)].toFixed(1),
              max: +deltas[deltas.length - 1].toFixed(1),
            });
          }
        };
        const max = document.documentElement.scrollHeight - window.innerHeight;
        let y = 0;
        const iv = setInterval(() => {
          y += max / 30;
          if (y >= max) clearInterval(iv);
          window.scrollTo(0, Math.min(y, max));
        }, 33);
        requestAnimationFrame(step);
      })
  );
  const ok = jank.max < 50;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} jank: p95=${jank.p95}ms max=${jank.max}ms (bar: max < 50ms)`);
  await page.close();
}

// Anchor offset + heading text. Both are defects that render "correctly":
// an anchor hidden under a sticky nav, and split type whose innerText lost
// its spaces. Neither is visible in a screenshot.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForFunction("window.__ready === true", { timeout: 12000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));

  const headings = await page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3")]
      .map((h) => h.innerText.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 12)
  );
  console.log("\nheading text (confirm the words are actually separated):");
  for (const h of headings) console.log(`  "${h}"`);

  // measure the tallest fixed/sticky bar pinned to the top of the viewport
  const chromeH = await page.evaluate(() => {
    let tallest = 0;
    for (const e of document.querySelectorAll("*")) {
      const s = getComputedStyle(e);
      if (s.position !== "fixed" && s.position !== "sticky") continue;
      if (s.visibility === "hidden" || +s.opacity < 0.05) continue;
      const r = e.getBoundingClientRect();
      // top-pinned bar: starts at the top edge, spans most of the width,
      // and is short enough to be chrome rather than a pinned scene
      if (r.top <= 2 && r.width >= innerWidth * 0.5 && r.height > 8 && r.height < innerHeight * 0.4)
        tallest = Math.max(tallest, Math.round(r.height));
    }
    return tallest;
  });

  const anchors = await page.evaluate(() =>
    [...new Set(
      [...document.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && h.length > 1 && document.querySelector(h))
    )]
  );

  if (!anchors.length || !chromeH) {
    console.log(`SKIP anchor offset (anchors: ${anchors.length}, top chrome: ${chromeH}px)`);
  } else {
    // smooth scrollers (Lenis) keep easing after a fixed delay on long pages, so wait
    // until scrollY holds still: a scroll left running skews the next anchor's reading
    const settle = () => page.evaluate(() => new Promise((done) => {
      let last = -1, still = 0, frames = 0;
      const tick = () => {
        const y = window.scrollY;
        still = y === last ? still + 1 : 0;
        last = y;
        if (still >= 12 || ++frames > 360) done();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }));
    const obscured = [];
    for (const sel of anchors) {
      await settle();
      await page.evaluate(() => window.scrollTo(0, 0));
      await settle();
      await page.evaluate((s) => document.querySelector(`a[href="${s}"]`).click(), sel);
      await new Promise((r) => setTimeout(r, 300));
      await settle();
      const top = await page.evaluate((s) => {
        const el = document.querySelector(s);
        // headings first: a bare [class*=tag] also matches "stage" (s-tag-e), so a
        // pinned hero's sticky stage would be measured instead of its h1
        const first = el.querySelector("h1,h2,h3") || el.querySelector("[class*=stat],[class*=tag]") || el;
        return Math.round(first.getBoundingClientRect().top);
      }, sel);
      if (top < chromeH) obscured.push(`${sel} (content at ${top}px, chrome is ${chromeH}px)`);
    }
    const ok = obscured.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"} anchor offset (${anchors.length} anchors vs ${chromeH}px chrome): ` +
      (obscured.join("; ") || "all clear")
    );
    if (!ok) console.log("  fix: html { scroll-padding-top: " + (chromeH + 24) + "px }");
  }
  await page.close();
}

// Stuck reveals. A .reveal/.rise element whose observer was never attached
// sits at opacity 0 forever, and the section reads as "empty" rather than
// broken. Critically this is INVISIBLE to ?jump= screenshots, because the
// jump contract force-adds the reveal class - so it must be checked on a
// real scroll, with no jump parameter.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2500));
  const max = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < max; y += 450) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await new Promise((r) => setTimeout(r, 170));
  }
  await new Promise((r) => setTimeout(r, 1500));

  const stuck = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if (+s.opacity >= 0.9) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 20) continue;
      if (!(el.innerText || "").trim()) continue;
      // only content that is gated behind a reveal/entrance class
      if (!/reveal|rise|fade|enter|anim/i.test(String(el.className))) continue;
      out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 26)} (opacity ${s.opacity})`);
    }
    return [...new Set(out)].slice(0, 6);
  });
  const ok = stuck.length === 0;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} reveals fire${ok ? "" : ":\n  " + stuck.join("\n  ") +
    "\n  cause is usually a section whose IntersectionObserver was never attached"}`);
  await page.close();
}

// Social card. A missing og:image fails silently - the page looks finished
// and the link preview is blank wherever it gets shared.
{
  const page = await browser.newPage();
  await page.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });

  const meta = await page.evaluate(() => {
    const get = (sel) => document.querySelector(sel)?.getAttribute("content")?.trim() || "";
    return {
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      type: get('meta[property="og:type"]'),
      title: get('meta[property="og:title"]'),
      desc: get('meta[property="og:description"]'),
      url: get('meta[property="og:url"]'),
      image: get('meta[property="og:image"]'),
      twCard: get('meta[name="twitter:card"]'),
      twImage: get('meta[name="twitter:image"]'),
      lang: document.documentElement.lang,
      ogLocale: get('meta[property="og:locale"]'),
    };
  });

  const missing = [];
  for (const [k, label] of [["title", "og:title"], ["desc", "og:description"],
    ["type", "og:type"], ["url", "og:url"], ["image", "og:image"],
    ["twCard", "twitter:card"], ["canonical", "rel=canonical"]])
    if (!meta[k]) missing.push(label);

  // absolute URLs only - scrapers ignore relative ones
  for (const [k, label] of [["url", "og:url"], ["image", "og:image"], ["twImage", "twitter:image"]])
    if (meta[k] && !/^https?:\/\//i.test(meta[k])) missing.push(`${label} not absolute (${meta[k]})`);

  if (/^he\b/i.test(meta.lang) && !meta.ogLocale) missing.push("og:locale (Hebrew site)");
  if (meta.image && /\.webp(\?|$)/i.test(meta.image))
    missing.push("og:image is WebP - LinkedIn/WhatsApp render it unreliably, use JPEG/PNG");

  // the asset must actually ship: fetch og:image's path from the local build
  let assetNote = "";
  if (meta.image) {
    try {
      const p = new URL(meta.image).pathname;
      const r = await page.evaluate(async (u) => {
        try { const res = await fetch(u, { method: "HEAD" }); return res.status; } catch { return 0; }
      }, new URL(p, TARGET).href);
      if (r !== 200) missing.push(`og:image not in build (${p} -> ${r || "unreachable"})`);
      else assetNote = ` asset ${p} 200`;
    } catch { missing.push(`og:image is not a valid URL (${meta.image})`); }
  }

  const ok = missing.length === 0;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} social card:${ok ? assetNote : " missing " + missing.join(", ")}`);

  // House style: no em/en dashes in shipped copy. They survive review easily
  // because they look like hyphens at small sizes, and they land in <title>
  // and og: tags where they are hardest to spot.
  const dashes = await page.evaluate(() => {
    const hits = [];
    const push = (where, s) => { if (/[–—]/.test(s)) hits.push(`${where}: ${s.trim().slice(0, 60)}`); };
    push("title", document.title);
    for (const m of document.querySelectorAll("meta[property^='og:'], meta[name^='twitter:'], meta[name='description']"))
      push(m.getAttribute("property") || m.getAttribute("name"), m.getAttribute("content") || "");
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n, seen = 0;
    while ((n = walk.nextNode()) && seen < 6)
      if (/[–—]/.test(n.nodeValue)) { hits.push(`text: ${n.nodeValue.trim().slice(0, 60)}`); seen++; }
    return hits;
  });
  const dOk = dashes.length === 0;
  if (!dOk) failures++;
  console.log(`${dOk ? "PASS" : "FAIL"} no long dashes${dOk ? "" : ":\n  " + dashes.slice(0, 6).join("\n  ")}`);

  // Structured data (references/seo-schema.md): every JSON-LD block must parse, and an
  // @id may be *defined* only once. A second, thinner copy of the business node (the
  // paste-a-snippet mistake) splits the entity Google is trying to merge. A node with
  // nothing but @id/@type is a reference, not a definition.
  const ld = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent || ""));
  const ldErr = [];
  const types = new Set();
  const defined = new Map();
  const visit = (n) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== "object") return;
    if (n["@type"]) types.add([].concat(n["@type"]).join("/"));
    const body = Object.keys(n).filter((k) => !["@id", "@type", "@context"].includes(k));
    if (n["@id"] && body.length) defined.set(n["@id"], (defined.get(n["@id"]) || 0) + 1);
    for (const v of Object.values(n)) if (v && typeof v === "object") visit(v);
  };
  ld.forEach((txt, i) => {
    try { visit(JSON.parse(txt)); } catch (e) { ldErr.push(`block ${i + 1} is not valid JSON (${String(e.message).slice(0, 60)})`); }
  });
  for (const [id, c] of defined) if (c > 1) ldErr.push(`${id} is defined ${c} times: keep one node, extend it instead`);
  if (!ld.length) {
    console.log("SKIP structured data: none on this page (a business site needs it: references/seo-schema.md)");
  } else {
    const ldOk = ldErr.length === 0;
    if (!ldOk) failures++;
    console.log(`${ldOk ? "PASS" : "FAIL"} structured data: ${ld.length} block(s)` +
      (ldOk ? `, types ${[...types].join(", ")}` : `:\n  ${ldErr.join("\n  ")}`));
  }
  await page.close();
}

// SEO, GEO and performance (references/seo-geo.md). Four views of one page: the raw
// HTML (what a crawler that runs no JavaScript receives, AI crawlers included), the
// rendered DOM, a phone-sized pass over every control, and a throttled mobile load.
// Only real defects FAIL; judgement calls are WARN lines, which never fail the build.
{
  let warns = 0;
  const warn = (m) => { warns++; console.log(`WARN ${m}`); };
  const fail = (m) => { failures++; console.log(`FAIL ${m}`); };
  const pass = (m) => console.log(`PASS ${m}`);
  const target = new URL(TARGET);
  const origin = target.origin;
  const local = /^(localhost|127\.|\[?::1)/.test(target.hostname);
  const get = async (u) => {
    try {
      const r = await fetch(u, { redirect: "follow" });
      const type = r.headers.get("content-type") || "";
      return { status: r.status, type, headers: r.headers, text: r.status < 400 ? await r.text() : "" };
    } catch { return { status: 0, type: "", headers: new Headers(), text: "" }; }
  };
  const isHtml = (r) => /text\/html/i.test(r.type) || /^\s*<(!doctype|html)/i.test(r.text);
  const samePath = (a, b) => a.replace(/\/index\.html$/, "/").replace(/\/+$/, "") === b.replace(/\/index\.html$/, "/").replace(/\/+$/, "");
  // phone numbers in one form: digits only, a leading 0 becomes the 972 country code
  const phone = (v) => { const d = String(v).replace(/\D/g, ""); return d.startsWith("0") ? "972" + d.slice(1) : d; };

  // 1. the raw HTML: a client-rendered page is an empty page to these crawlers
  const rawRes = await get(TARGET);
  const raw = rawRes.text;
  const strip = (h) => h.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
  const head = (raw.match(/<head[\s\S]*?<\/head>/i) || [""])[0];
  const body = (raw.match(/<body[\s\S]*<\/body>/i) || [raw])[0];
  const words = strip(body).split(" ").filter(Boolean).length;
  const rawH1 = strip((body.match(/<h1[\s\S]*?<\/h1>/i) || [""])[0]);
  const attr = (tag, name) => (tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i")) || [])[1] || "";
  const rawCanonical = attr((head.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [""])[0], "href");
  const rawRobots = attr((head.match(/<meta[^>]+name=["']robots["'][^>]*>/i) || [""])[0], "content");
  const rawTitle = strip((head.match(/<title[\s\S]*?<\/title>/i) || [""])[0]);
  const rawLd = (raw.match(/<script[^>]+application\/ld\+json/gi) || []).length;
  if (!rawH1) fail("raw HTML has no <h1>: without JavaScript the page is empty to crawlers, AI crawlers included. Prerender it");
  else if (words < 150) warn(`raw HTML carries only ${words} words: most of the page exists only after JavaScript`);
  else pass(`raw HTML: h1 "${rawH1.slice(0, 48)}", ${words} words readable without JavaScript`);
  if (Buffer.byteLength(raw) > 2 * 1024 * 1024) fail(`raw HTML is ${Math.round(Buffer.byteLength(raw) / 1024)} KB: Googlebot reads only the first 2 MB`);

  // 2. the rendered page, watched from its first frame
  const page = await browser.newPage();
  const errors = [];
  const badRequests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => { if (!/^data:/.test(r.url())) badRequests.push(`${r.url().split("/").pop().slice(0, 40)} (${r.failure()?.errorText || "failed"})`); });
  page.on("response", (r) => { if (r.status() >= 400 && new URL(r.url()).origin === origin) badRequests.push(`${new URL(r.url()).pathname} -> ${r.status()}`); });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 45000 });
  // an early frame: a white flash, a layout jump or an entrance starting from blank
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: path.join(OUT, "laptop-00-early.jpg"), type: "jpeg", quality: 70 });
  const earlyBg = await page.evaluate(() => {
    const c = (el) => getComputedStyle(el).backgroundColor;
    const html = c(document.documentElement), body = c(document.body);
    return /rgba\(0, 0, 0, 0\)|transparent/.test(body) ? html : body;
  });
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 45000 }).catch(() => {});
  await page.waitForFunction("window.__ready === true", { timeout: 12000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500)); // deferred hero video starts after load + idle
  const assets = await page.evaluate(() => {
    const lum = (rgb) => { const m = rgb.match(/\d+(\.\d+)?/g); if (!m) return 1; const [r, g, b, a] = m.map(Number); if (a === 0) return 1; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const finalBg = /rgba\(0, 0, 0, 0\)|transparent/.test(bodyBg) ? getComputedStyle(document.documentElement).backgroundColor : bodyBg;
    const h1 = document.querySelector("h1");
    const fam = h1 ? getComputedStyle(h1).fontFamily.split(",")[0].replace(/["']/g, "").trim() : "";
    const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, "") === fam);
    return {
      finalLum: lum(finalBg),
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src)).map((i) => (i.currentSrc || i.src).split("/").pop()),
      videos: [...document.querySelectorAll("video")].map((v) => ({
        src: (v.currentSrc || v.querySelector("source")?.src || "").split("/").pop(),
        auto: v.autoplay || v.hasAttribute("data-autoplay"), paused: v.paused, ready: v.readyState, error: v.error?.code || 0,
      })),
      h1Font: fam, h1Size: h1 ? getComputedStyle(h1).fontSize : "",
      h1Loaded: !faces.length ? null : faces.some((f) => f.status === "loaded"),
    };
  });
  const lumOf = (rgb) => { const m = rgb.match(/\d+(\.\d+)?/g); if (!m) return 1; const [r, g, b, a] = m.map(Number); if (a === 0) return 1; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  if (assets.finalLum < 0.3 && lumOf(earlyBg) > 0.85) fail(`white first paint on a dark design (early ${earlyBg}): set the background on html, body as the first CSS rule`);
  if (badRequests.length) fail(`failed requests: ${[...new Set(badRequests)].slice(0, 5).join(", ")}`);
  if (assets.broken.length) fail(`broken images: ${assets.broken.slice(0, 5).join(", ")}`);
  for (const v of assets.videos) {
    if (v.error) fail(`video ${v.src || "(no src)"} failed to decode (MediaError ${v.error})`);
    else if (v.auto && v.paused) warn(`video ${v.src || "(no src)"} should autoplay but is paused (readyState ${v.ready}): a poster that looks fine in a screenshot`);
  }
  if (assets.h1Font && assets.h1Loaded === false) fail(`the h1 renders in a fallback face: "${assets.h1Font}" never loaded`);
  else if (assets.h1Font) pass(`h1 set in ${assets.h1Font}${assets.h1Loaded ? " (loaded)" : " (system face)"} at ${assets.h1Size}; early frame saved as laptop-00-early.jpg`);
  const dom = await page.evaluate(() => {
    const name = (i) => (i.currentSrc || i.src || "").split("/").pop().slice(0, 40);
    const imgs = [...document.images];
    const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.content?.trim() || "";
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent || "");
    const focusable = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
    return {
      title: document.title.trim(),
      desc: meta("description"),
      robotsMeta: meta("robots").toLowerCase(),
      robots: `${meta("robots")},${meta("googlebot")}`.toLowerCase(),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      h1: document.querySelectorAll("h1").length,
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      ld,
      alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
        .map((l) => ({ code: l.getAttribute("hreflang"), href: l.getAttribute("href") || "" })),
      text: document.body.innerText.replace(/\s+/g, " "),
      tels: [...document.querySelectorAll('a[href^="tel:"], a[href*="wa.me/"]')].map((a) => a.getAttribute("href")),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      pseudo: [...document.querySelectorAll('a[href="#"], a[href^="javascript:"], a:not([href])')].length,
      noAlt: imgs.filter((i) => !i.hasAttribute("alt")).map(name),
      noDims: imgs.filter((i) => !(i.getAttribute("width") && i.getAttribute("height"))).map(name),
      // a source over 3x its displayed width is wasted bytes even on a 2x screen
      oversized: imgs.filter((i) => i.clientWidth > 40 && i.naturalWidth > i.clientWidth * 3)
        .map((i) => `${name(i)} (${i.naturalWidth}px shown at ${i.clientWidth}px)`),
      highPriority: document.querySelectorAll('img[fetchpriority="high"]').length,
      blocking: [...document.head.querySelectorAll("script[src]")]
        .filter((s) => !s.async && !s.defer && s.type !== "module").map((s) => s.src.split("/").pop()),
      blankNoOpener: [...document.querySelectorAll('a[target="_blank"]')]
        .filter((a) => !/noopener|noreferrer/.test(a.rel)).length,
      // aria-hidden must never wrap something a keyboard (or an agent) can reach
      hiddenFocus: [...document.querySelectorAll('[aria-hidden="true"]')]
        .filter((h) => !h.closest("[inert]") && h.querySelector(focusable))
        .map((h) => `${h.tagName.toLowerCase()}.${String(h.className).split(/\s+/)[0]}`).slice(0, 4),
      hydrate: window.__hydrateErrors || 0,
    };
  });
  // the accessibility tree is what assistive tech and browsing agents act on
  const cdp = await page.createCDPSession();
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  const ACT = new Set(["button", "link", "textbox", "combobox", "checkbox", "radio", "slider", "searchbox", "menuitem", "tab", "switch"]);
  const unnamed = nodes.filter((n) => !n.ignored && ACT.has(n.role?.value) && !String(n.name?.value || "").trim())
    .map((n) => n.role.value);
  await page.close();

  const headerRobots = (rawRes.headers.get("x-robots-tag") || "").toLowerCase();
  const robotsAll = `${dom.robots},${headerRobots}`;
  const noindex = /noindex|\bnone\b/.test(robotsAll);
  if (!dom.title) fail("no <title>");
  else if (dom.title.length < 10 || dom.title.length > 65) warn(`title is ${dom.title.length} chars (aim 10 to 65, it gets cut in results): "${dom.title}"`);
  if (!dom.desc) warn("no meta description: Google writes its own snippet");
  else if (dom.desc.length < 70 || dom.desc.length > 160) warn(`meta description is ${dom.desc.length} chars (aim 70 to 160)`);
  if (dom.h1 === 0) fail("no <h1> on the rendered page");
  else if (dom.h1 > 1) warn(`${dom.h1} <h1> elements: one per page reads clearest`);
  if (!dom.lang) fail("<html> has no lang");
  else if (/^(he|ar|fa|ur)\b/i.test(dom.lang) && dom.dir !== "rtl") fail(`lang="${dom.lang}" without dir="rtl"`);
  if (dom.noAlt.length) fail(`images without an alt attribute (alt="" marks decoration): ${dom.noAlt.join(", ")}`);
  if (dom.noDims.length) warn(`images without width/height (layout shift while they load): ${dom.noDims.slice(0, 5).join(", ")}`);
  if (dom.oversized.length) warn(`oversized images: ${dom.oversized.slice(0, 4).join(", ")}`);
  if (dom.highPriority > 2) warn(`${dom.highPriority} images with fetchpriority="high": past one or two it stops helping`);
  if (dom.blocking.length) warn(`render-blocking scripts in <head>: ${dom.blocking.join(", ")}`);
  if (dom.blankNoOpener) warn(`${dom.blankNoOpener} target="_blank" link(s) without rel="noopener"`);
  if (dom.pseudo) warn(`${dom.pseudo} pseudo-link(s) (href="#", javascript:, or <a> without href): use a <button>`);
  if (unnamed.length) fail(`controls with no accessible name (agents and screen readers see a blank): ${[...new Set(unnamed)].join(", ")} x${unnamed.length}`);
  if (dom.hiddenFocus.length) fail(`aria-hidden wraps focusable elements: ${dom.hiddenFocus.join(", ")} (add inert, or tabindex="-1" on the copies)`);
  if (dom.hydrate) fail(`${dom.hydrate} hydration mismatch(es): the prerendered HTML and the app disagree`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 3).join(" | ")}`);
  if (dom.title && dom.h1 === 1 && dom.lang && !dom.noAlt.length && !unnamed.length && !dom.hiddenFocus.length && !dom.hydrate && !errors.length)
    pass(`on-page basics: title, one h1, lang="${dom.lang}"${dom.dir ? ` dir="${dom.dir}"` : ""}, alt on every image, named controls, clean hydration`);

  // raw and rendered must agree on everything a crawler acts on
  const parity = [];
  if (rawCanonical !== dom.canonical) parity.push(`canonical ("${rawCanonical}" raw, "${dom.canonical}" rendered)`);
  if (rawRobots.toLowerCase().replace(/\s+/g, "") !== dom.robotsMeta.replace(/\s+/g, "")) parity.push(`robots meta ("${rawRobots}" raw, "${dom.robotsMeta}" rendered)`);
  if (!rawLd && dom.ld.length) parity.push("JSON-LD exists only after JavaScript");
  if (parity.length) fail(`raw and rendered HTML disagree: ${parity.join("; ")}`);
  else if (rawTitle && rawTitle !== dom.title) warn(`the title changes after JavaScript ("${rawTitle}" raw)`);
  else pass("raw and rendered HTML agree on canonical, robots and structured data");

  // 3. indexability. A deliberate noindex page (a demo, a campaign landing) says so loudly.
  if (noindex) {
    console.log("INFO NOINDEX: this page asks search engines to leave it out (robots meta or X-Robots-Tag)");
    if (dom.canonical) {
      try { if (!samePath(new URL(dom.canonical, TARGET).pathname, target.pathname)) fail(`noindex page canonicalised to another path (${dom.canonical}): two conflicting signals`); } catch {}
    }
  } else {
    let cOk = true;
    if (!dom.canonical) { cOk = false; fail("no rel=canonical on an indexable page"); }
    else if (!/^https:\/\//i.test(dom.canonical)) { cOk = false; fail(`canonical must be an absolute https URL: "${dom.canonical}"`); }
    else if (!samePath(new URL(dom.canonical).pathname, target.pathname)) { cOk = false; fail(`canonical path ${new URL(dom.canonical).pathname} is not this page (${target.pathname}): the classic one-shared-head SPA bug`); }
    if (/nosnippet|max-snippet\s*:\s*0\b/.test(robotsAll)) { cOk = false; fail("nosnippet / max-snippet:0 on an indexable page: it is dropped from AI Overviews and AI Mode"); }
    if (cOk) pass(`indexable, canonical ${dom.canonical}`);
  }

  // 4. crawl access: robots.txt, read the way crawlers read it (RFC 9309: the most
  // specific user-agent group, then the longest matching rule; a tie goes to Allow)
  const robots = await get(`${origin}/robots.txt`);
  const groups = new Map();
  let sitemapUrl = "";
  if (robots.status >= 500) fail(`robots.txt answers ${robots.status}: crawlers treat that as "disallow everything"`);
  else if (robots.status === 200 && isHtml(robots)) fail("robots.txt is served as an HTML page (a catch-all rewrite): crawlers cannot read any rules");
  else if (robots.status === 200) {
    let agents = [], inRules = false;
    for (const line of robots.text.split(/\r?\n/)) {
      const m = line.replace(/#.*/, "").trim().match(/^([a-z-]+)\s*:\s*(.*)$/i);
      if (!m) continue;
      const [, k, v] = m;
      if (/^user-agent$/i.test(k)) {
        if (inRules) { agents = []; inRules = false; }
        agents.push(v.toLowerCase());
        for (const a of agents) if (!groups.has(a)) groups.set(a, []);
      } else if (/^(dis)?allow$/i.test(k)) {
        inRules = true;
        for (const a of agents) groups.get(a).push([k.toLowerCase(), v.trim()]);
      } else if (/^sitemap$/i.test(k)) sitemapUrl = v.trim();
    }
  }
  const toRe = (p) => {
    const end = p.endsWith("$");
    const core = (end ? p.slice(0, -1) : p).split("*").map((x) => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    return new RegExp("^" + core + (end ? "$" : ""));
  };
  const allowed = (ua, path) => {
    const rules = groups.get(ua.toLowerCase()) ?? groups.get("*") ?? [];
    let best = null;
    for (const [k, v] of rules) {
      if (!v || !toRe(v).test(path)) continue;
      if (!best || v.length > best[1].length || (v.length === best[1].length && k === "allow")) best = [k, v];
    }
    return !best || best[0] === "allow";
  };
  if (noindex) {
    if (groups.size && !allowed("Googlebot", target.pathname)) warn("robots.txt blocks this noindex page: crawlers never fetch it, so they never see the noindex");
    console.log("INFO robots.txt and sitemap checks skipped on a noindex page");
  } else if (robots.status !== 200) {
    warn("no robots.txt: add one with an absolute Sitemap: line (references/seo-geo.md)");
  } else if (!(robots.status === 200 && isHtml(robots))) {
    if (!allowed("*", "/") && !allowed("Googlebot", "/")) fail("robots.txt disallows the site for every crawler");
    // search and answer crawlers decide whether the site can be cited; user-triggered
    // fetchers only read a page someone asked about; training bots do not affect search
    const SEARCH = ["Googlebot", "Bingbot", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Applebot"];
    const ON_DEMAND = ["ChatGPT-User", "Claude-User", "Perplexity-User"];
    const TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"];
    const off = (list) => list.filter((ua) => !allowed(ua, target.pathname));
    const [bs, bd, bt] = [off(SEARCH), off(ON_DEMAND), off(TRAINING)];
    if (bs.length) warn(`robots.txt blocks search crawlers, so the site cannot be cited by them: ${bs.join(", ")}`);
    if (bd.length) warn(`robots.txt blocks on-demand fetchers (a person asking an assistant about this page gets nothing): ${bd.join(", ")}`);
    if (!bs.length) pass(`robots.txt lets search and AI-answer crawlers in${bt.length ? ` (training-only bots opted out: ${bt.join(", ")})` : ""}`);
    if (!sitemapUrl) warn("robots.txt has no Sitemap: line");
    else if (!/^https?:\/\//i.test(sitemapUrl)) warn(`the Sitemap: line must be an absolute URL ("${sitemapUrl}")`);
  }

  // 5. the sitemap: every URL in it must exist and be indexable
  if (!noindex) {
    const smPath = sitemapUrl ? new URL(sitemapUrl, origin).pathname : "/sitemap.xml";
    const sm = await get(origin + smPath);
    if (sm.status !== 200 || !/<urlset|<sitemapindex/i.test(sm.text)) warn(`no sitemap at ${smPath}`);
    else {
      const locs = [...sm.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
      const probs = [];
      const hosts = new Set();
      for (const l of locs) {
        try { const u = new URL(l); hosts.add(u.host); if (u.protocol !== "https:") probs.push(`not https: ${l}`); }
        catch { probs.push(`not an absolute URL: ${l}`); }
      }
      if (hosts.size > 1) probs.push(`mixed hosts: ${[...hosts].join(", ")}`);
      // checked on the served copy: a demo maps the client's URLs onto its own host
      for (const l of locs.filter((x) => !/\.(jpe?g|png|webp|avif|gif|svg|pdf)$/i.test(x)).slice(0, 30)) {
        let p; try { p = new URL(l).pathname; } catch { continue; }
        const r = await get(origin + p);
        if (r.status !== 200) { probs.push(`${p} -> ${r.status}`); continue; }
        if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(r.text)) probs.push(`${p} is noindex`);
        const c = attr((r.text.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [""])[0], "href");
        try { if (c && !samePath(new URL(c, origin).pathname, p)) probs.push(`${p} canonicalises to ${c}`); } catch {}
      }
      if (probs.length) fail(`sitemap ${smPath}: ${probs.slice(0, 5).join("; ")}`);
      else pass(`sitemap ${smPath}: ${locs.length} URL(s), all resolve and are indexable`);
      if (!locs.some((l) => { try { return samePath(new URL(l).pathname, target.pathname); } catch { return false; } }))
        warn(`this page (${target.pathname}) is not listed in the sitemap`);
    }
  }

  // 6. soft 404s and discovery files. A catch-all rewrite answers 200 with the home page
  // for every unknown path, which crawlers index as duplicates. Local static servers
  // differ from the host here, so this is only judged on a deployed URL.
  if (local) console.log("INFO soft-404 probe skipped on localhost (judge it on the deployed URL)");
  else {
    const probe = await get(`${origin}/__verify-404-${Date.now()}`);
    if (probe.status === 200) fail("unknown paths answer 200 (soft 404): drop the catch-all rewrite and ship a real 404 page");
    else pass(`unknown paths answer ${probe.status}`);
  }
  const llms = await get(`${origin}/llms.txt`);
  if (llms.status === 200 && isHtml(llms)) { if (!local) fail("/llms.txt answers with an HTML page (a catch-all rewrite)"); }
  else if (llms.status === 200) {
    const okLlms = /^\s*#\s+.+/m.test(llms.text) && /\[.+\]\(.+\)/.test(llms.text) && llms.text.length >= 50;
    if (!okLlms) fail("/llms.txt exists but is not valid (needs a # title, at least one [link](url), 50+ chars)");
    else console.log("INFO llms.txt present and well formed (optional: Google Search ignores it, see references/seo-geo.md)");
  } else console.log("INFO llms.txt absent (fine: Google Search ignores it, see references/seo-geo.md)");

  // 7. hreflang, only when the page declares alternates
  if (dom.alternates.length) {
    const probs = [];
    const CODE = /^([a-z]{2}(-[A-Z][a-z]{3})?(-[A-Z]{2})?|x-default)$/;
    for (const a of dom.alternates) {
      if (!CODE.test(a.code) || /^(iw|heb)\b/.test(a.code)) probs.push(`invalid code "${a.code}"`);
      if (!/^https:\/\//.test(a.href)) probs.push(`"${a.code}" href is not absolute https`);
    }
    if (dom.canonical && !dom.alternates.some((a) => a.href === dom.canonical)) probs.push("no self-reference (an alternate equal to the canonical)");
    const own = dom.alternates.find((a) => a.href === dom.canonical);
    if (own && own.code !== "x-default" && dom.lang && own.code.split("-")[0] !== dom.lang.split("-")[0]) probs.push(`<html lang="${dom.lang}"> but its own hreflang is "${own.code}"`);
    if (probs.length) fail(`hreflang: ${probs.join("; ")}`);
    else pass(`hreflang: ${dom.alternates.map((a) => a.code).join(", ")}`);
    if (dom.alternates.length > 1 && !dom.alternates.some((a) => a.code === "x-default")) warn("hreflang set without x-default");
  }

  // 8. the structured data must describe this page (references/seo-schema.md laws 2 and 5)
  if (dom.ld.length) {
    const nodes = [];
    const walk = (n) => { if (Array.isArray(n)) return n.forEach(walk); if (n && typeof n === "object") { nodes.push(n); Object.values(n).forEach(walk); } };
    for (const t of dom.ld) { try { walk(JSON.parse(t)); } catch {} }
    const types = new Set(nodes.flatMap((n) => [].concat(n["@type"] || [])));
    const ldPhones = [...new Set(nodes.flatMap((n) => [].concat(n.telephone || [])).map(phone))];
    const pagePhones = new Set(dom.tels.map((h) => phone(h.replace(/^tel:/, "").replace(/.*wa\.me\//, "").split("?")[0])));
    const probs = [];
    if (ldPhones.length && pagePhones.size && !ldPhones.some((p) => pagePhones.has(p))) probs.push(`JSON-LD telephone ${ldPhones.join(", ")} is not a number this page links to`);
    const norm = (x) => String(x).replace(/\s+/g, " ").trim();
    const faqQs = nodes.filter((n) => [].concat(n["@type"] || []).includes("Question")).map((n) => norm(n.name || ""));
    const hiddenQs = faqQs.filter((q) => q && !dom.text.includes(q));
    if (hiddenQs.length) probs.push(`FAQ question(s) not visible on the page: "${hiddenQs[0].slice(0, 50)}"${hiddenQs.length > 1 ? ` +${hiddenQs.length - 1}` : ""}`);
    if (probs.length) fail(`structured data vs page: ${probs.join("; ")}`);
    else pass(`structured data matches the page${ldPhones.length ? " (phone, " : " ("}${faqQs.length} FAQ question(s) visible)`);
    if (ldPhones.length && !dom.tels.some((h) => h.startsWith("tel:"))) warn("JSON-LD has a telephone but the page has no tel: link");
    const RETIRED = ["HowTo", "SpecialAnnouncement", "ClaimReview", "VehicleListing", "EstimatedSalary", "LearningVideo", "Attorney"];
    const retired = RETIRED.filter((t) => types.has(t));
    if (retired.length) warn(`schema types with no rich result any more (or deprecated): ${retired.join(", ")}`);
    if (types.has("FAQPage")) console.log("INFO FAQPage: Google retired FAQ rich results on 2026-05-07. The markup can stay; expect no rich result");
  }

  // 9. links: internal pages must answer 200 and every #fragment must have a target
  {
    const probs = [];
    const seen = new Set();
    for (const h of dom.links) {
      if (/^(mailto:|tel:|javascript:|data:)/i.test(h) || h === "#") continue;
      let u; try { u = new URL(h, TARGET); } catch { continue; }
      if (u.origin !== origin) continue;
      if (u.hash && samePath(u.pathname, target.pathname)) {
        seen.add("#" + decodeURIComponent(u.hash.slice(1)));
        continue;
      }
      if (samePath(u.pathname, target.pathname) || seen.has(u.pathname)) continue;
      seen.add(u.pathname);
      if (seen.size > 40) break;
      const r = await get(origin + u.pathname);
      if (r.status !== 200) probs.push(`${u.pathname} -> ${r.status}`);
    }
    const ids = [...seen].filter((x) => x.startsWith("#")).map((x) => x.slice(1));
    if (ids.length) {
      const p2 = await browser.newPage();
      await p2.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 45000 });
      const missing = await p2.evaluate((list) => list.filter((id) => !document.getElementById(id)), ids);
      await p2.close();
      for (const id of missing) probs.push(`#${id} has no target`);
    }
    if (probs.length) fail(`broken internal links: ${probs.slice(0, 6).join("; ")}`);
    else pass(`internal links resolve (${[...seen].length} checked)`);
  }

  // 10. phone-sized pass over every control: nothing may sit on top of a button or a
  // link (a glow, grain or canvas layer without pointer-events: none), and the page may
  // not add history entries while it scrolls (Google treats that as back-button hijacking)
  {
    const p3 = await browser.newPage();
    await p3.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await p3.evaluateOnNewDocument(() => {
      window.__pushes = 0;
      const push = history.pushState.bind(history);
      history.pushState = (...a) => { if (!navigator.userActivation?.isActive) window.__pushes++; return push(...a); };
    });
    await p3.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });
    await p3.waitForFunction("window.__ready === true", { timeout: 12000 }).catch(() => {});
    const histStart = await p3.evaluate(() => history.length);
    const controls = await p3.evaluate(() =>
      [...document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]')]
        .map((el, i) => { el.dataset.verifyCtl = String(i); return i; }));
    const occluded = [], small = [];
    for (const i of controls.slice(0, 90)) {
      const r = await p3.evaluate(async (i) => {
        const el = document.querySelector(`[data-verify-ctl="${i}"]`);
        if (!el || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return null;
        const b0 = el.getBoundingClientRect();
        if (b0.width < 4 || b0.height < 4) return null; // visually hidden inputs inside a label
        const fixed = (() => { for (let n = el; n; n = n.parentElement) if (getComputedStyle(n).position === "fixed") return true; return false; })();
        if (!fixed) { el.scrollIntoView({ block: "center", behavior: "instant" }); await new Promise((d) => setTimeout(d, 140)); }
        const b = el.getBoundingClientRect();
        if (b.bottom < 0 || b.top > innerHeight) return null; // pinned content that only shows mid-scrub
        const x = b.left + b.width / 2, y = b.top + b.height / 2;
        const hit = document.elementFromPoint(x, y);
        const label = `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/)[0] : ""}`;
        const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
        return {
          label,
          occludedBy: hit && hit !== el && !el.contains(hit) && !hit.contains(el)
            ? `${hit.tagName.toLowerCase()}${hit.className && typeof hit.className === "string" ? "." + hit.className.split(/\s+/)[0] : ""}` : "",
          small: !inline && (b.width < 24 || b.height < 24) ? `${label} ${Math.round(b.width)}x${Math.round(b.height)}` : "",
        };
      }, i);
      if (!r) continue;
      if (r.occludedBy) occluded.push(`${r.label} under ${r.occludedBy}`);
      if (r.small) small.push(r.small);
    }
    const hist = await p3.evaluate((h0) => ({ grew: history.length - h0, pushes: window.__pushes }), histStart);
    await p3.close();
    if (occluded.length) fail(`controls covered by another element at 390px (taps miss them): ${[...new Set(occluded)].slice(0, 5).join("; ")}`);
    else pass(`every visible control at 390px is reachable (${Math.min(controls.length, 90)} checked)`);
    if (small.length) warn(`tap targets under 24px: ${[...new Set(small)].slice(0, 5).join(", ")}`);
    if (hist.pushes || hist.grew > 0) fail(`history entries added without a click (${hist.pushes} pushState, history grew by ${hist.grew}): back-button hijacking`);
  }

  // 11. a throttled mobile load: the lab version of what a phone on a slow network gets
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await m.emulateCPUThrottling(4);
  if (NETWORK?.["Slow 4G"]) await m.emulateNetworkConditions(NETWORK["Slow 4G"]);
  await m.evaluateOnNewDocument(() => {
    const lab = (window.__lab = { lcp: 0, el: null, url: "", shifts: [] });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) { lab.lcp = e.startTime; lab.el = e.element || lab.el; lab.url = e.url || ""; }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) lab.shifts.push([e.startTime, e.value]);
    }).observe({ type: "layout-shift", buffered: true });
  });
  await m.goto(TARGET, { waitUntil: "load", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 3000));
  const lab = await m.evaluate(() => {
    const { lcp, el, url, shifts } = window.__lab;
    // CLS is the worst session window: shifts less than 1 s apart, a window at most 5 s long
    let cls = 0, cur = 0, winStart = -1, last = -1;
    for (const [t, v] of shifts) {
      if (winStart < 0 || t - last > 1000 || t - winStart > 5000) { cur = 0; winStart = t; }
      cur += v; last = t; cls = Math.max(cls, cur);
    }
    let desc = "unknown", img = null;
    if (el) {
      desc = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") +
        (typeof el.className === "string" && el.className ? `.${el.className.split(/\s+/)[0]}` : "");
      if (el.tagName === "IMG") {
        const file = (el.currentSrc || el.src).split("/").pop();
        const preloaded = [...document.querySelectorAll('link[rel="preload"][as="image"]')].some((l) =>
          [l.getAttribute("href") || "", ...(l.getAttribute("imagesrcset") || "").split(",")]
            .some((c) => c.trim() && c.trim().split(/\s+/)[0].endsWith(file)));
        img = { file, lazy: el.loading === "lazy", high: el.getAttribute("fetchpriority") === "high", preloaded };
      }
    }
    // LCP subparts (web.dev): time to first byte, load delay, load duration, render delay
    const nav = performance.getEntriesByType("navigation")[0];
    const ttfb = nav ? nav.responseStart : 0;
    const res = url ? performance.getEntriesByName(url)[0] : null;
    const loadStart = res ? res.requestStart || res.startTime : ttfb;
    const loadEnd = res ? res.responseEnd : ttfb;
    const parts = { ttfb: Math.round(ttfb), delay: Math.round(Math.max(0, loadStart - ttfb)), load: Math.round(Math.max(0, loadEnd - loadStart)), render: Math.round(Math.max(0, lcp - Math.max(loadEnd, ttfb))) };
    const all = performance.getEntriesByType("resource");
    const kb = (re) => Math.round(all.filter((r) => re.test(new URL(r.name).pathname))
      .reduce((a, r) => a + (r.encodedBodySize || r.transferSize || 0), 0) / 1024);
    const heavy = all.filter((r) => /\.(webp|avif|jpe?g|png|gif)$/i.test(new URL(r.name).pathname))
      .map((r) => [new URL(r.name).pathname.split("/").pop(), Math.round((r.encodedBodySize || r.transferSize || 0) / 1024)])
      .filter(([, k]) => k > 200);
    return {
      lcp: Math.round(lcp), cls: +cls.toFixed(3), desc, img, parts, heavy,
      js: kb(/\.m?js$/), css: kb(/\.css$/), font: kb(/\.woff2?$/), image: kb(/\.(webp|avif|jpe?g|png|gif|svg)$/),
    };
  });
  await m.close();

  // Chrome does not throttle loopback connections, so a localhost LCP is optimistic
  const lcpMsg = `LCP ${lab.lcp}ms on ${lab.desc} (lab: 390px, 4x CPU, Slow 4G${local ? ", but localhost is not network-throttled: judge LCP on the deployed URL" : ""}; good is under 2500ms)`;
  if (!lab.lcp) warn("LCP was not reported (nothing painted, or the browser lacks the API)");
  else if (lab.lcp > 4000) fail(lcpMsg);
  else if (lab.lcp > 2500) warn(lcpMsg);
  else pass(lcpMsg);
  if (lab.lcp) {
    const { ttfb, delay, load, render } = lab.parts;
    console.log(`     LCP subparts: TTFB ${ttfb}ms, load delay ${delay}ms, load ${load}ms, render delay ${render}ms`);
    if (lab.lcp > 1800 && delay >= lab.lcp * 0.4) warn("LCP load delay is 40%+ of LCP: the browser finds the hero image late (preload it, keep it in the HTML)");
    if (lab.lcp > 1800 && render >= lab.lcp * 0.4) warn("LCP render delay is 40%+ of LCP: something (an entrance animation, a loader, late JS) holds the hero back");
    if (!lab.img && render > 1000) warn(`the LCP text waits ${render}ms to paint after the HTML arrives: is an entrance animation gating the headline?`);
  }
  if (lab.img?.lazy) fail(`the LCP image is loading="lazy": it waits for layout before it even starts`);
  else if (lab.img && !lab.img.high && !lab.img.preloaded) warn(`the LCP image has neither fetchpriority="high" nor a preload`);
  if (lab.img && !raw.includes(lab.img.file)) warn(`the LCP image (${lab.img.file}) is not in the raw HTML: it is discovered only after JavaScript runs`);
  const clsMsg = `CLS ${lab.cls}, worst session window during load (good is 0.1 or less)`;
  if (lab.cls > 0.25) fail(clsMsg);
  else if (lab.cls > 0.1) warn(clsMsg);
  else pass(clsMsg);
  const tooHeavy = lab.heavy.filter(([, k]) => k > 500);
  if (tooHeavy.length) fail(`images over 500 KB: ${tooHeavy.map(([f, k]) => `${f} ${k} KB`).join(", ")}`);
  else if (lab.heavy.length) warn(`images over 200 KB: ${lab.heavy.map(([f, k]) => `${f} ${k} KB`).join(", ")}`);
  const weight = `weight as served: JS ${lab.js} KB, CSS ${lab.css} KB, fonts ${lab.font} KB, images ${lab.image} KB`;
  if (lab.image > 2048) warn(`${weight}. Images over the 2 MB page budget`);
  else if (lab.js > 600) warn(`${weight}. JS over 600 KB before compression: split or trim it`);
  else pass(weight);
  if (warns) console.log(`     ${warns} SEO/performance warning(s): judgement calls, not failures`);
}

await browser.close();
console.log(failures === 0 ? `\nALL PASS. screenshots in ${OUT}` : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
