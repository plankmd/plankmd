/*!
 * PlankMD player: the model a page shows, and its translation in the page's
 * language (docs/proposals/translations.md). Used by the booklet and the
 * video, which take the same addresses as the player:
 *   #<sample>                          a bundled model (samples.js)
 *   ?src=<url>                         a model on the web; its translation is
 *                                      <name>.<lang>.plank.md next to it
 *   #code=<base64url>[&tr=<base64url>] a model, and its translation, in the
 *                                      link itself: the player opens the
 *                                      booklet and the video this way
 * MIT License. Works in Node (require) and in the browser (window.PlankMDSource).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlankMDSource = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // UTF-8 text <-> base64url, for links that carry a model.
  function encode(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(code) {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  }

  // The address of the translation of a model at `url` in `lang`.
  const translationUrl = (url, lang) => url.replace(/(\.plank)?\.md(?=$|[?#])/, `.${lang}.plank.md`);

  /**
   * Returns { text, translation }: the model's text, and its translation in
   * `lang` (null when there is none, or when the model is already in `lang`).
   * `location` is the page's location, `samples` and `translations` the
   * bundled ones (window.PLANKMD_SAMPLES and window.PLANKMD_TRANSLATIONS).
   */
  async function load({ location, lang, samples = {}, translations = {}, fetch = (...args) => globalThis.fetch(...args) }) {
    const isTranslation = (t) => typeof t === 'string' && /^translation-of:/m.test(t);
    const own = (text, translation) => {
      const m = text.match(/^lang:\s*["']?([\w-]+)/m);
      return { text, translation: isTranslation(translation) && !(m && m[1] === lang) ? translation : null };
    };
    if (location.hash.startsWith('#code=')) {
      const hash = new URLSearchParams(location.hash.slice(1));
      return own(decode(hash.get('code')), hash.get('tr') ? decode(hash.get('tr')) : null);
    }
    const src = new URLSearchParams(location.search).get('src');
    if (src) {
      const text = await (await fetch(src)).text();
      let translation = null;
      try {
        const r = await fetch(translationUrl(src, lang));
        if (r.ok) translation = await r.text();
      } catch { /* no translation: the model reads in its own language */ }
      return own(text, translation);
    }
    const name = decodeURIComponent(location.hash.slice(1));
    const key = name in samples ? name : samples['gallery/castle'] ? 'gallery/castle' : Object.keys(samples)[0];
    return own(samples[key], (translations[key] || {})[lang]);
  }

  return { encode, decode, translationUrl, load };
});
