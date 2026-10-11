#!/usr/bin/env node
'use strict';

// Prints the building booklet of a model to PDF (A4):
//
//   node scripts/booklet.js gallery/castle.plank.md [-o castle.pdf] [--lang fr]
//
// It opens player/booklet.html in Chrome (see scripts/chrome.js) and prints
// it: a cover with the finished model, then every step with its
// instructions and its views. The same page prints from any browser.

const fs = require('fs');
const { openPlayerPage } = require('./chrome.js');

async function main() {
  const args = process.argv.slice(2);
  let file = null, out = null, lang = 'en';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--out') out = args[++i];
    else if (args[i] === '--lang') lang = args[++i];
    else if (!file) file = args[i];
    else throw new Error(`unexpected argument: ${args[i]}`);
  }
  if (!file) throw new Error('usage: node scripts/booklet.js <model.plank.md> [-o out.pdf] [--lang fr]');
  out = out || file.replace(/(\.plank)?\.md$/, '') + '.pdf';
  const text = fs.readFileSync(file, 'utf8');
  const { browser, page } = await openPlayerPage('booklet.html', `?render=1&lang=${encodeURIComponent(lang)}`);
  try {
    await page.waitForFunction(() => window.PlankMDBooklet);
    const info = await page.evaluate((t) => window.PlankMDBooklet.build(t), text);
    // Let the pictures decode before printing.
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))));
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`✓ ${out}: "${info.title}", ${info.planks} planks, ${info.steps} steps`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
