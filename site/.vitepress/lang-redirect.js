// Inlined in the <head> of every page (see config.mts), so that it runs
// before the page is drawn.
//
// - A visitor who lands on an English page, has made no choice yet, and whose
//   browser prefers French to English, is sent to the French page.
// - Following a link from one language to the other (the language menu, or
//   any link) records that choice, and the redirect never happens again.
// - Crawlers are never redirected: both versions are indexed, linked by
//   hreflang alternates.
(function () {
  var KEY = 'plankmd-lang'
  var isFr = function (path) { return path === '/fr' || path.indexOf('/fr/') === 0 }
  var store = function (value) { try { localStorage.setItem(KEY, value) } catch (e) {} }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null
    if (!a) return
    var url = new URL(a.href, location.href)
    if (url.origin !== location.origin) return
    // The player has its own EN/FR switch, and French pages link to it with ?lang=fr.
    if (url.pathname.indexOf('/player/') === 0) return
    if (isFr(url.pathname) !== isFr(location.pathname)) store(isFr(url.pathname) ? 'fr' : 'en')
  }, true)

  if (isFr(location.pathname)) return
  var chosen = null
  try { chosen = localStorage.getItem(KEY) } catch (e) {}
  if (chosen) return
  if (/bot|crawl|spider|slurp|preview|lighthouse/i.test(navigator.userAgent)) return

  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']
  for (var i = 0; i < langs.length; i++) {
    var lang = String(langs[i]).toLowerCase()
    if (lang.indexOf('en') === 0) return
    if (lang.indexOf('fr') === 0) {
      location.replace('/fr' + location.pathname + location.search + location.hash)
      return
    }
  }
})()
