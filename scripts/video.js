#!/usr/bin/env node
'use strict';

// Renders the building video of a model to MP4, frame by frame:
//
//   node scripts/video.js gallery/castle.plank.md [-o castle.mp4]
//        [--vertical] [--lang fr] [--fps 30] [--crf 20]
//
// It opens player/video.html in Chrome (the one installed on this machine,
// or CHROME_PATH), asks it for every frame in turn and pipes the pictures to
// ffmpeg, so the video is smooth whatever the speed of the machine. Needs
// Chrome, ffmpeg, and the puppeteer-core dev dependency (npm install).
// The result is H.264 in an MP4 container, ready for YouTube: 1920 × 1080,
// or 1080 × 1920 with --vertical, for Shorts.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

function parseArgs(argv) {
  const opts = { fps: 30, crf: 20, lang: 'en', vertical: false, file: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') opts.out = argv[++i];
    else if (a === '--vertical') opts.vertical = true;
    else if (a === '--lang') opts.lang = argv[++i];
    else if (a === '--fps') opts.fps = Number(argv[++i]);
    else if (a === '--crf') opts.crf = Number(argv[++i]);
    else if (!opts.file) opts.file = a;
    else throw new Error(`unexpected argument: ${a}`);
  }
  if (!opts.file) throw new Error('usage: node scripts/video.js <model.plank.md> [-o out.mp4] [--vertical] [--lang fr] [--fps 30] [--crf 20]');
  opts.out = opts.out || opts.file.replace(/(\.plank)?\.md$/, '') + (opts.vertical ? '-vertical' : '') + '.mp4';
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const text = fs.readFileSync(opts.file, 'utf8');
  let puppeteer;
  try { puppeteer = require('puppeteer-core'); } catch {
    throw new Error('needs the "puppeteer-core" dev dependency: npm install');
  }
  const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome not found: set CHROME_PATH');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    // The graphics card renders a 1080p frame in tens of milliseconds, the
    // software renderer (SwiftShader, used where there is no GPU) in about a
    // second.
    args: ['--allow-file-access-from-files', '--hide-scrollbars', '--enable-gpu',
      ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []),
      ...(process.env.PLANKMD_SOFTWARE_GL ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [])],
  });
  try {
    const page = await browser.newPage();
    const url = pathToFileURL(path.join(__dirname, '..', 'player', 'video.html'));
    url.search = `?render=1&lang=${encodeURIComponent(opts.lang)}${opts.vertical ? '&format=vertical' : ''}`;
    await page.goto(url.href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.PlankMDVideo && document.body.dataset.ready === 'true');
    const info = await page.evaluate((t) => window.PlankMDVideo.load(t), text);
    const frames = Math.ceil(info.duration * opts.fps);
    const [w, h] = opts.vertical ? [1080, 1920] : [1920, 1080];
    console.log(`${opts.file}: "${info.title}", ${info.planks} planks, ${info.steps} steps, ${info.duration.toFixed(1)} s, ${frames} frames`);

    const ffmpeg = spawn('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(opts.fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', String(opts.crf), '-pix_fmt', 'yuv420p',
      '-s', `${w}x${h}`, '-r', String(opts.fps), '-movflags', '+faststart', opts.out,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((resolve, reject) => {
      ffmpeg.on('error', (err) => reject(new Error(`ffmpeg: ${err.message} (is it installed?)`)));
      ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))));
    });

    const started = Date.now();
    for (let i = 0; i < frames; i++) {
      const dataUrl = await page.evaluate((t) => window.PlankMDVideo.jpeg(t, 0.92), i / opts.fps);
      const jpeg = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
      if (!ffmpeg.stdin.write(jpeg)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
      if (i % opts.fps === 0 || i === frames - 1) {
        process.stdout.write(`\r  frame ${i + 1}/${frames} (${Math.round((100 * (i + 1)) / frames)}%), ${((Date.now() - started) / 1000).toFixed(0)} s`);
      }
    }
    ffmpeg.stdin.end();
    await done;
    process.stdout.write('\n');
    console.log(`✓ ${opts.out}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
