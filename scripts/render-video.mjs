#!/usr/bin/env node
// render-video.mjs - render an HTML animation to MP4, frame-exact.
// Usage:
//   node scripts/render-video.mjs <url-or-html-file> <out.mp4> [options]
//     --fps 30            frames per second (default 30)
//     --size 1080x1920    output size in CSS px (default 1080x1080)
//     --scale 1           device pixel ratio (2 renders 4x the pixels)
//     --duration 15       seconds, overrides window.__duration
//     --audio music.mp3   mux a soundtrack, trimmed to the video
//     --preview           write first, middle and last frame PNGs instead,
//                         to check composition and the loop seam fast
//
// The page implements the render contract (references/opus-videos.md):
//   window.__duration  length in seconds (or pass --duration)
//   window.__seek(t)   draw the frame at time t; may return a promise
//   window.__ready     true once fonts, images and media are loaded
// A page without __seek still renders if all its motion is CSS or WAAPI:
// every document animation is paused and seeked to t.
//
// Each frame is seeked, painted, screenshotted and piped to ffmpeg, so the
// output never drops or doubles a frame however heavy the page is. Do not
// screen-record a rAF animation for a deliverable: it stutters.
// Requires: npm i puppeteer-core (in this folder), a local Chrome, ffmpeg.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath, pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.match(/^--(fps|size|scale|duration|audio)$/));
const [TARGET, OUT] = positional;
if (!TARGET || !OUT) {
  console.error("usage: node render-video.mjs <url-or-html-file> <out.mp4> [--fps 30] [--size 1080x1080] [--scale 1] [--duration s] [--audio file] [--preview]");
  process.exit(2);
}
const FPS = Number(flag("fps", 30));
const [W, H] = flag("size", "1080x1080").split("x").map(Number);
const SCALE = Number(flag("scale", 1));
const AUDIO = flag("audio", null);
const PREVIEW = args.includes("--preview");
if (!PREVIEW && ((W * SCALE) % 2 || (H * SCALE) % 2)) {
  console.error("output width and height must be even for H.264 (yuv420p)"); process.exit(2);
}
const url = /^https?:|^file:/.test(TARGET) ? TARGET : pathToFileURL(path.resolve(TARGET)).href;

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

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("page error:", e.message));
// Lets a page skip its own live rAF loop while it is being rendered.
await page.evaluateOnNewDocument(() => { window.__rendering = true; });
await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page
  .waitForFunction("!('__ready' in window) || window.__ready === true", { timeout: 30000 })
  .catch(() => console.warn("warn: window.__ready never became true, rendering anyway"));

const duration = Number(flag("duration", 0)) || await page.evaluate(() => window.__duration);
if (!(duration > 0)) {
  console.error("no duration: set window.__duration in the page or pass --duration");
  await browser.close(); process.exit(2);
}
const total = Math.round(duration * FPS);

async function frameAt(t) {
  await page.evaluate(async (t) => {
    if (typeof window.__seek === "function") await window.__seek(t);
    else for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
    // two frames: the seek's DOM writes are committed and painted
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, t);
  return page.screenshot({ type: "png", optimizeForSpeed: true });
}

if (PREVIEW) {
  const base = OUT.replace(/\.[a-z0-9]+$/i, "");
  for (const i of [0, Math.floor(total / 2), total - 1]) {
    const file = `${base}-${String(i).padStart(4, "0")}.png`;
    fs.writeFileSync(file, await frameAt(i / FPS));
    console.log(`wrote ${file} (t=${(i / FPS).toFixed(2)}s)`);
  }
  console.log("loop seam: the first and last frames should read as consecutive frames.");
  await browser.close();
  process.exit(0);
}

const ffArgs = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-"];
if (AUDIO) ffArgs.push("-i", AUDIO);
// -map_metadata -1: no tags from the soundtrack (artist, encoder, paths) end up in the file
ffArgs.push("-map_metadata", "-1", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart");
if (AUDIO) ffArgs.push("-c:a", "aac", "-b:a", "192k", "-shortest");
ffArgs.push(OUT);
const ff = spawn("ffmpeg", ffArgs, { stdio: ["pipe", "inherit", "inherit"] });
ff.on("error", (e) => { console.error("ffmpeg failed to start:", e.message); process.exit(2); });

const started = Date.now();
for (let i = 0; i < total; i++) {
  const png = await frameAt(i / FPS);
  if (!ff.stdin.write(png)) await once(ff.stdin, "drain");
  if (i % FPS === 0 || i === total - 1) {
    process.stdout.write(`\rframe ${i + 1}/${total} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
}
ff.stdin.end();
const [code] = await once(ff, "close");
await browser.close();
if (code !== 0) { console.error(`\nffmpeg exited with ${code}`); process.exit(1); }
const mb = (fs.statSync(OUT).size / 1e6).toFixed(1);
console.log(`\nwrote ${OUT}: ${W * SCALE}x${H * SCALE}, ${duration}s at ${FPS}fps, ${mb} MB`);
