#!/usr/bin/env node
// capture-og.mjs - screenshot the real hero as the social card.
// Usage:
//   node scripts/capture-og.mjs <url> <outfile.jpg> [waitMs]
// Produces 1200x630 jpeg. Warns if over 300 KB (many crawlers skip big cards).
// After wiring it into og:/twitter: meta with ABSOLUTE production URLs,
// prove it live: curl -sI https://<site>/og.jpg && curl -s https://<site> | grep og:image

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [TARGET, OUTFILE, WAIT] = [process.argv[2], process.argv[3] || "public/og.jpg", +(process.argv[4] || 3500)];
if (!TARGET) { console.error("usage: node capture-og.mjs <url> [outfile] [waitMs]"); process.exit(2); }

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

const browser = await puppeteer.launch({ executablePath: chromePath, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.goto(TARGET, { waitUntil: "networkidle0", timeout: 45000 });
await page
  .waitForFunction("window.__ready === true", { timeout: 12000 })
  .catch(() => console.log("warn: __ready never fired, capturing anyway"));
await new Promise((r) => setTimeout(r, WAIT));
await page.screenshot({ path: OUTFILE, type: "jpeg", quality: 85 });
await browser.close();

const kb = Math.round(fs.statSync(OUTFILE).size / 1024);
console.log(`og card: ${OUTFILE} (${kb} KB)${kb > 300 ? " - OVER 300 KB, recompress" : ""}`);
