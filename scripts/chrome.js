'use strict';

// Opens a page of the player in the Chrome installed on this machine (or
// CHROME_PATH), for scripts/video.js and scripts/booklet.js. Needs the
// puppeteer-core dev dependency.

const fs = require('fs');
const path = require('path');
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

/** Launches Chrome and opens player/<page> with the query `search`. Returns { browser, page }. */
async function openPlayerPage(name, search) {
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
    // second. PLANKMD_SOFTWARE_GL=1 forces the software renderer.
    args: ['--allow-file-access-from-files', '--hide-scrollbars', '--enable-gpu',
      ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []),
      ...(process.env.PLANKMD_SOFTWARE_GL ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [])],
  });
  const page = await browser.newPage();
  const url = pathToFileURL(path.join(__dirname, '..', 'player', name));
  url.search = search;
  await page.goto(url.href, { waitUntil: 'load' });
  return { browser, page };
}

module.exports = { openPlayerPage };
