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
// Exit code 1 on any failure. Requires: npm i puppeteer-core, a local Chrome.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TARGET = process.argv[2];
const OUT = process.argv[3] || "./shots";
if (!TARGET) { console.error("usage: node verify.mjs <url> [outdir]"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

let puppeteer;
try {
  ({ default: puppeteer } = await import("puppeteer-core"));
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
  await page.setViewport({ width: w, height: h });
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
  console.log(`${ok ? "PASS" : "FAIL"} overflow @${name} (${w}x${h}): ${worst}px`);

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
    const obscured = [];
    for (const sel of anchors) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 250));
      await page.evaluate((s) => document.querySelector(`a[href="${s}"]`).click(), sel);
      await new Promise((r) => setTimeout(r, 900));
      const top = await page.evaluate((s) => {
        const el = document.querySelector(s);
        const first = el.querySelector("h1,h2,h3,[class*=stat],[class*=tag]") || el;
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
  await page.close();
}

await browser.close();
console.log(failures === 0 ? `\nALL PASS. screenshots in ${OUT}` : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
