#!/usr/bin/env node
// verify.mjs - the full verification sweep for a built site.
// Usage:
//   1. Build and serve the site locally (e.g. python3 -m http.server 5199 -d dist)
//   2. node scripts/verify.mjs http://localhost:5199 [outdir]
//
// Checks, per viewport (390x844, 768x1024, 1024x768, 1440x900, 1920x1080):
//   - horizontal overflow at 0/30/75/95% scroll depth, BOTH edges (RTL-safe)
//   - fixed/sticky chrome collisions at the smallest viewport
//   - section screenshots saved to outdir (default ./shots)
// Plus a jank probe at 1440x900: rAF deltas during a scroll sweep, p95/max.
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
      const els = [...document.querySelectorAll("*")].filter((e) => {
        const s = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        return (s.position === "fixed" || s.position === "sticky") &&
          r.width > 8 && r.height > 8 && s.visibility !== "hidden" && +s.opacity > 0.05;
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

  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, `${name}-top.jpg`), type: "jpeg", quality: 82 });
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * 0.5));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, `${name}-mid.jpg`), type: "jpeg", quality: 82 });
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

await browser.close();
console.log(failures === 0 ? `\nALL PASS. screenshots in ${OUT}` : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
