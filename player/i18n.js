/*!
 * PlankMD player strings, in English and French, and the choice of language.
 * Loaded by player/index.html and player/gallery.html (window.PlankMDI18n),
 * and by the tests in Node. No dependencies, no build step.
 *
 * The language is, in order: ?lang=fr|en in the address, the choice stored
 * under 'plankmd-lang' (the key the plankmd.org website uses too), the
 * browser's languages (French if it comes before English), else English.
 *
 * The validator (src/plankmd.js) and the balance check (src/physics.js) report
 * in English, with stable codes. In French, the player explains each
 * diagnostic from its code and its fields, and keeps the code, the line and
 * the plank numbers.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlankMDI18n = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KEY = 'plankmd-lang';
  const LANGS = ['en', 'fr'];

  /** Picks the language from the address, the stored choice and the browser's languages. */
  function pick({ search = '', stored = null, languages = [] } = {}) {
    const asked = (new URLSearchParams(search).get('lang') || '').toLowerCase();
    if (LANGS.includes(asked)) return asked;
    if (LANGS.includes(stored)) return stored;
    for (const l of languages) {
      const lang = String(l).toLowerCase();
      if (lang.startsWith('en')) return 'en';
      if (lang.startsWith('fr')) return 'fr';
    }
    return 'en';
  }

  function detect() {
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch { /* storage unavailable */ }
    const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    return pick({ search: location.search, stored, languages });
  }

  function store(lang) {
    try { localStorage.setItem(KEY, lang); } catch { /* storage unavailable */ }
  }

  const s = (n) => (n === 1 ? '' : 's');
  const sFr = (n) => (n <= 1 ? '' : 's'); // French: 0 and 1 are singular
  const q = (text) => `« ${text} »`;
  // Decimal comma in French, for numbers and for numbers quoted from English messages.
  const num = (lang, x, digits) => {
    const t = typeof x === 'number' ? x.toFixed(digits) : String(x);
    return lang === 'fr' ? t.replace(/(\d)\.(\d)/g, '$1,$2') : t;
  };

  const STRINGS = {
    en: {
      pageTitle: 'PlankMD Player',
      player: 'player',
      language: 'Language',
      sample: 'Sample',
      open: 'Open…',
      openTitle: 'Open a .plank.md file',
      checkBalance: 'Check balance',
      slow: '(slow on big models)',
      step: 'Step',
      plank: 'Plank',
      prevPlank: 'Previous plank',
      nextPlank: 'Next plank',
      dropTest: 'Drop test',
      dropTitle: 'Drop the planks shown in a physics engine, all at once',
      replay: 'Replay build',
      replayTitle: 'Place the planks one by one in a physics engine, in building order, up to the plank shown',
      reset: 'Reset',
      source: 'PlankMD source',
      footer: 'Drop a <span class="code">.plank.md</span> file on the scene, or edit the source. Drag to orbit, scroll to zoom.',
      gallery: 'Gallery',
      spec: 'Spec',
      site: 'https://plankmd.org',
      dropHere: 'Drop a .plank.md file',
      legendGuide: 'guide, remove after use',
      legendError: 'cannot be built',
      legendFloating: 'rests on nothing',
      legendFall: 'would fall',
      guidesInStep: (n) => `${n} guide${s(n)} in this step: lay ${n === 1 ? 'it' : 'them'} to measure the gap, then take ${n === 1 ? 'it' : 'them'} away.`,
      cannotStand: (n) => `Plank ${n}: the construction cannot stand like this.`,
      stepWithstands: (tilt, dir) => `End of this step: withstands a ${tilt}° tilt (towards ${dir}).`,
      stepFalls: 'End of this step: the construction falls.',
      stepMeasuring: 'End of this step: measuring the tilt…',
      stepNotMeasured: 'End of this step: stands. The tilt is only measured at the last step of a big model.',
      measureStep: 'Measure the tilt of this step',
      hint: (n, line, id) => `Plank ${n}, line ${line}${id ? `, ${id}` : ''}`,
      planks: (n) => `${n} plank${s(n)}`,
      steps: (n) => `${n} step${s(n)}`,
      difficulty: (d) => `difficulty ${d}/5`,
      by: (author) => `by ${author}`,
      untitled: 'Untitled model',
      model: 'Model',
      valid: 'Valid: no error, no warning',
      codeLine: (code, line) => `${code}${line ? ` (line ${line})` : ''}`,
      balanceChecking: (pct) => `Balance: checking…${pct === undefined ? '' : ` ${pct}%`}`,
      balanceError: (error) => `Balance: not checked (${error}).`,
      balanceSkipped: (reason) => `Balance: not checked, ${reason}.`,
      balanceFalls: (from, to) => `Balance: falls from plank ${from}${to ? ` to plank ${to}` : ''}.`,
      balanceMeasuring: (k, total) => `Balance: stands at every placement. Measuring the tilt it withstands: step ${k} of ${total}…`,
      balanceMeasuringLast: 'Balance: stands at every placement. Measuring the tilt it withstands once built…',
      balanceStandsLast: (tilt) => `Balance: stands at every placement, withstands a ${tilt}° tilt once built (measured at the last step only, on a model this big).`,
      balanceStands: (tilt, worst) => `Balance: stands at every placement, withstands a ${tilt}° tilt once built` +
        (worst ? ` (${worst}° during the build)` : '') + '.',
      simLoading: 'Loading the physics engine…',
      simLoadFailed: (msg) => `Could not load the physics engine (${msg}).`,
      simPlacing: (k, n) => `Placing plank ${k} of ${n}…`,
      simRunning: (t) => `Simulating… ${t} s`,
      simFellBuild: (n, moved) => `Fell during the build, once plank ${n} was placed` +
        (moved ? `: ${moved} plank${s(moved)} moved in the end.` : '.'),
      simStoodBuild: (n) => `Stood through the whole build (${n} planks).`,
      simStood: 'Stood: no plank moved.',
      simFell: (moved, cm, n) => `Fell: ${moved} plank${s(moved)} moved, up to ${cm} cm (plank ${n}).`,
      loadFailed: (url, msg) => `Could not load ${url}: ${msg}`,
      booklet: 'Booklet (PDF)',
      video: 'Video',
      githubLoading: (where) => `Loading models from ${where} on GitHub…`,
      githubFrom: 'From GitHub:',
      githubGroup: (where) => `GitHub: ${where}`,
      githubFailed: (where, why) => `Could not load ${where} from GitHub: ${why}.`,
      githubBadAddress: (address) => `Not a GitHub repository, folder, file or gist: ${address}`,
      githubWhy: (reason, detail) => ({
        'not-found': 'not found, or private',
        'rate-limit': `GitHub allows 60 requests an hour without an account${detail ? `, try again after ${detail}` : ''}`,
        none: 'there is no .plank.md file in it',
      }[reason] || `network error (${detail})`),
      githubIntro: (n, where) => `${n} model${s(n)} from ${where} on GitHub. Click one to open it in the player.`,
      githubRepoLink: 'See on GitHub',
      galleryTitle: 'PlankMD Gallery',
      galleryHeading: 'PlankMD gallery',
      galleryIntro: 'Every gallery model stands at every placement (balance check) and in a drop test, except the diving board and the leaning tower, which fall on purpose. Click one to open it in the player.',
      playerLink: 'Player',
    },
    fr: {
      pageTitle: 'Lecteur PlankMD',
      player: 'lecteur',
      language: 'Langue',
      sample: 'Exemple',
      open: 'Ouvrir…',
      openTitle: 'Ouvrir un fichier .plank.md',
      checkBalance: "Vérifier l'équilibre",
      slow: '(lent sur les grands modèles)',
      step: 'Étape',
      plank: 'Planchette',
      prevPlank: 'Planchette précédente',
      nextPlank: 'Planchette suivante',
      dropTest: 'Test de chute',
      dropTitle: "Lâcher d'un coup les planchettes affichées dans un moteur physique",
      replay: 'Rejouer le montage',
      replayTitle: "Poser les planchettes une à une dans un moteur physique, dans l'ordre de montage, jusqu'à la planchette affichée",
      reset: 'Réinitialiser',
      source: 'Source PlankMD',
      footer: 'Déposez un fichier <span class="code">.plank.md</span> sur la scène, ou modifiez la source. Faites glisser pour tourner, utilisez la molette pour zoomer.',
      gallery: 'Galerie',
      spec: 'Spécification',
      site: 'https://plankmd.org/fr/',
      dropHere: 'Déposez un fichier .plank.md',
      legendGuide: 'guide, à retirer après usage',
      legendError: 'impossible à construire',
      legendFloating: 'ne repose sur rien',
      legendFall: 'tomberait',
      guidesInStep: (n) => (n === 1
        ? "1 guide dans cette étape : posez-le pour mesurer l'écart, puis retirez-le."
        : `${n} guides dans cette étape : posez-les pour mesurer l'écart, puis retirez-les.`),
      cannotStand: (n) => `Planchette ${n} : la construction ne peut pas tenir ainsi.`,
      stepWithstands: (tilt, dir) => `Fin de cette étape : résiste à une inclinaison de ${tilt}° (vers ${dir}).`,
      stepFalls: 'Fin de cette étape : la construction tombe.',
      stepMeasuring: "Fin de cette étape : mesure de l'inclinaison…",
      stepNotMeasured: "Fin de cette étape : tient. Sur un grand modèle, l'inclinaison n'est mesurée qu'à la dernière étape.",
      measureStep: "Mesurer l'inclinaison de cette étape",
      hint: (n, line, id) => `Planchette ${n}, ligne ${line}${id ? `, ${id}` : ''}`,
      planks: (n) => `${n} planchette${sFr(n)}`,
      steps: (n) => `${n} étape${sFr(n)}`,
      difficulty: (d) => `difficulté ${d}/5`,
      by: (author) => `par ${author}`,
      untitled: 'Modèle sans titre',
      model: 'Modèle',
      valid: 'Valide : aucune erreur, aucun avertissement',
      codeLine: (code, line) => `${code}${line ? ` (ligne ${line})` : ''}`,
      balanceChecking: (pct) => `Équilibre : vérification…${pct === undefined ? '' : ` ${pct} %`}`,
      balanceError: (error) => `Équilibre : non vérifié (${error}).`,
      balanceSkipped: (reason) => `Équilibre : non vérifié, ${reason}.`,
      balanceFalls: (from, to) => (to
        ? `Équilibre : tombe de la planchette ${from} à la planchette ${to}.`
        : `Équilibre : tombe à partir de la planchette ${from}.`),
      balanceMeasuring: (k, total) => `Équilibre : tient à chaque pose. Mesure de l'inclinaison supportée : étape ${k} sur ${total}…`,
      balanceMeasuringLast: "Équilibre : tient à chaque pose. Mesure de l'inclinaison supportée une fois monté…",
      balanceStandsLast: (tilt) => `Équilibre : tient à chaque pose, résiste à une inclinaison de ${tilt}° une fois monté (mesurée à la dernière étape seulement, sur un modèle de cette taille).`,
      balanceStands: (tilt, worst) => `Équilibre : tient à chaque pose, résiste à une inclinaison de ${tilt}° une fois monté` +
        (worst ? ` (${worst}° pendant le montage)` : '') + '.',
      simLoading: 'Chargement du moteur physique…',
      simLoadFailed: (msg) => `Impossible de charger le moteur physique (${msg}).`,
      simPlacing: (k, n) => `Pose de la planchette ${k} sur ${n}…`,
      simRunning: (t) => `Simulation… ${t} s`,
      simFellBuild: (n, moved) => `Tombe pendant le montage, une fois la planchette ${n} posée` +
        (moved ? ` : ${moved} planchette${sFr(moved)} ${moved === 1 ? 'a' : 'ont'} bougé au final.` : '.'),
      simStoodBuild: (n) => `Tient pendant tout le montage (${n} planchette${sFr(n)}).`,
      simStood: "Tient : aucune planchette n'a bougé.",
      simFell: (moved, cm, n) => `Tombe : ${moved} planchette${sFr(moved)} ${moved === 1 ? 'a' : 'ont'} bougé, jusqu'à ${cm} cm (planchette ${n}).`,
      loadFailed: (url, msg) => `Impossible de charger ${url} : ${msg}`,
      booklet: 'Notice (PDF)',
      video: 'Vidéo',
      githubLoading: (where) => `Chargement des modèles de ${where} sur GitHub…`,
      githubFrom: 'Depuis GitHub :',
      githubGroup: (where) => `GitHub : ${where}`,
      githubFailed: (where, why) => `Impossible de charger ${where} depuis GitHub : ${why}.`,
      githubBadAddress: (address) => `Ce n'est pas un dépôt, un dossier, un fichier ou un gist GitHub : ${address}`,
      githubWhy: (reason, detail) => ({
        'not-found': 'introuvable, ou privé',
        'rate-limit': `GitHub autorise 60 requêtes par heure sans compte${detail ? `, réessayez après ${detail}` : ''}`,
        none: "il ne contient aucun fichier .plank.md",
      }[reason] || `erreur réseau (${detail})`),
      githubIntro: (n, where) => `${n} modèle${sFr(n)} de ${where} sur GitHub. Cliquez sur un modèle pour l'ouvrir dans le lecteur.`,
      githubRepoLink: 'Voir sur GitHub',
      galleryTitle: 'Galerie PlankMD',
      galleryHeading: 'Galerie PlankMD',
      galleryIntro: "Chaque modèle de la galerie tient debout à chaque planchette posée (calcul d'équilibre) et au test de chute, sauf le plongeoir et la tour penchée, qui tombent exprès. Les livrets des modèles sont en anglais. Cliquez sur un modèle pour l'ouvrir dans le lecteur.",
      playerLink: 'Lecteur',
    },
  };

  // Reasons the balance check gives, or the player, when it does not run.
  const REASONS = {
    'the model has errors or floating planks: fix them first': 'le modèle a des erreurs ou des planchettes qui ne reposent sur rien : corrigez-les d\'abord',
    'the balance check could not start': "la vérification n'a pas pu démarrer",
    'this browser cannot run it in the background': 'ce navigateur ne peut pas la lancer en arrière-plan',
  };

  // French explanations of the diagnostics, by code. Each entry lists the
  // English messages it knows (a pattern and its translation), then a
  // general explanation built from the diagnostic's fields alone, used if
  // the English wording ever changes.
  const plank = (n, source) => `planchette ${n}${source !== undefined ? ` (${q(source)})` : ''}`;
  const Plank = (n, source) => `La ${plank(n, source)}`;
  const listOf = (ns) => (ns.length > 8 ? `${ns.slice(0, 8).join(', ')} et ${ns.length - 8} autres` : ns.length > 1 ? `${ns.slice(0, -1).join(', ')} et ${ns[ns.length - 1]}` : `${ns[0]}`);
  const FR_DIAGNOSTICS = {
    'E-frontmatter': [
      [/^Unexpected indented line: "(.*)"$/, (m) => `Ligne indentée inattendue : ${q(m[1])}`],
      [/^Not a "key: value" line: "(.*)"$/, (m) => `Ce n'est pas une ligne ${q('clé: valeur')} : ${q(m[1])}`],
      [/^"plank" must be three positive numbers/, () => `${q('plank')} doit être trois nombres positifs, par exemple [15, 3, 1]`],
      [/^"(.*)" must be an integer$/, (m) => `${q(m[1])} doit être un nombre entier`],
      [/^"(.*)" must be a positive number$/, (m) => `${q(m[1])} doit être un nombre positif`],
      [/^"palette" must be a mapping/, () => `${q('palette')} doit associer des noms à des couleurs`],
      () => "L'en-tête (frontmatter) contient une erreur",
    ],
    'W-frontmatter': [
      [/^Frontmatter has no "(.*)"$/, (m) => `L'en-tête (frontmatter) n'a pas de ${q(m[1])}`],
      () => "Il manque une clé dans l'en-tête (frontmatter)",
    ],
    'E-orientation': [
      [/^Unknown orientation "(.*?)"/, (m) => `Orientation inconnue ${q(m[1])} (attendu : flat-x, flat-y, edge-x, edge-y, up-x ou up-y)`],
      () => 'Orientation inconnue (attendu : flat-x, flat-y, edge-x, edge-y, up-x ou up-y)',
    ],
    'E-parse': [
      [/^Expected "<orientation> <x> <y> <z>", got "(.*)"$/, (m) => `Attendu ${q('<orientation> <x> <y> <z>')}, trouvé ${q(m[1])}`],
      [/^Expected key=value, got "(.*)"$/, (m) => `Attendu clé=valeur, trouvé ${q(m[1])}`],
      [/^Invalid value for (\S+): "(.*)"$/, (m) => `Valeur invalide pour ${m[1]} : ${q(m[2])}`],
      [/^"repeat" needs an "offset"$/, () => `${q('repeat')} demande un ${q('offset')}`],
      () => 'Ligne illisible',
    ],
    'W-unknown-attribute': [
      [/^Unknown attribute "(.*)" ignored$/, (m) => `Attribut inconnu ${q(m[1])}, ignoré`],
      () => 'Attribut inconnu, ignoré',
    ],
    'E-duplicate-id': [
      [/^plank \d+ \("(.*)"\): id "(.*)" is already used by plank (\d+)$/, (m, d) => `${Plank(d.plank, m[1])} : l'identifiant ${q(m[2])} est déjà utilisé par la planchette ${m[3]}`],
      (d) => `${Plank(d.plank)} : cet identifiant est déjà utilisé par une autre planchette`,
    ],
    'E-below-ground': [
      [/^plank \d+ \("(.*)"\) goes below the ground \(z = (.*)\)$/, (m, d) => `${Plank(d.plank, m[1])} passe sous le sol (z = ${num('fr', m[2])})`],
      (d) => `${Plank(d.plank)} passe sous le sol`,
    ],
    'E-overlap': [
      [/^plank \d+ \("(.*)"\) goes through plank (\d+) \(line (\d+)\)$/, (m, d) => `${Plank(d.plank, m[1])} traverse la planchette ${m[2]} (ligne ${m[3]})`],
      (d) => `${Plank(d.plank)} traverse la planchette ${d.other}`,
    ],
    'W-floating': [
      [/^plank \d+ \("(.*)"\) rests on nothing when it is placed$/, (m, d) => `${Plank(d.plank, m[1])} ne repose sur rien quand elle est posée`],
      (d) => `${Plank(d.plank)} ne repose sur rien quand elle est posée`,
    ],
    'E-guide-overlap': [
      [/^guide \("(.*)"\) goes through plank (\d+) \(line (\d+)\): the gap is too small$/,
        (m) => `Le guide (${q(m[1])}) traverse la planchette ${m[2]} (ligne ${m[3]}) : l'écart est trop petit`],
      (d) => `Le guide traverse la planchette ${d.other} : l'écart est trop petit`,
    ],
    'W-guide-loose': [
      [/^guide \("(.*?)"\) (?:only touches plank (\d+)|touches no plank)(?:, even with the (\d+) guides? it is chained to)?: /, (m) => {
        const chained = m[3] ? Number(m[3]) : 0;
        return `Le guide (${q(m[1])}) ${m[2] ? `ne touche que la planchette ${m[2]}` : 'ne touche aucune planchette'}` +
          (chained ? `, même avec ${chained === 1 ? 'le guide auquel il est relié' : `les ${chained} guides auxquels il est relié`}` : '') +
          " : un guide mesure l'écart entre deux planchettes, il est donc mal placé ou l'écart est trop grand";
      }],
      () => "Un guide mesure l'écart entre deux planchettes : celui-ci est mal placé, ou l'écart est trop grand",
    ],
    'W-inventory': [
      [/^(\d+) planks, but the inventory is (\d+)$/, (m) => `${m[1]} planchettes, mais l'inventaire n'en compte que ${m[2]}`],
      () => "Le modèle demande plus de planchettes que l'inventaire n'en compte",
    ],
    'I-unstable': [
      // Built from the fields: the planks that give way are all in `failing`.
      (d) => {
        const toEnd = !/It stands again afterwards/.test(d.message || '');
        const one = d.plank === d.until;
        const span = toEnd
          ? (one ? `Quand la planchette ${d.plank} est posée` : `À partir de la planchette ${d.plank}`)
          : (one ? `Tant que la planchette ${d.plank} est la dernière posée` : `De la planchette ${d.plank} à la planchette ${d.until}`);
        const failing = d.failing || [];
        const who = failing.length
          ? (failing.length > 1 ? ` (les planchettes ${listOf(failing)} ne peuvent pas rester en équilibre)` : ` (la planchette ${failing[0]} ne peut pas rester en équilibre)`)
          : '';
        return `${span}, la construction tombe${who}.` + (toEnd ? '' : " Elle tient de nouveau ensuite : tenez-la, ou changez l'ordre de pose.");
      },
    ],
    'I-fragile': [
      [/towards (\S+)\)/, (m, d) => `À la fin de l'étape ${d.step}, la construction tient, mais l'incliner de ${num('fr', d.tilt, 1)}° (vers ${m[1]}) suffit à la faire tomber.`],
      (d) => `À la fin de l'étape ${d.step}, la construction tient, mais l'incliner de ${num('fr', d.tilt, 1)}° suffit à la faire tomber.`,
    ],
  };

  /**
   * The text of a diagnostic in a language. `exact` is false when the French
   * text is the general explanation of the code (the English message was not
   * recognised), or when the code has no French explanation at all.
   */
  function explain(d, lang) {
    const rules = lang === 'fr' && FR_DIAGNOSTICS[d.code];
    if (!rules) return { text: d.message, exact: lang !== 'fr' };
    for (const rule of rules) {
      if (typeof rule === 'function') return { text: rule(d), exact: rules.length === 1 };
      const m = rule[0].exec(d.message || '');
      if (m) return { text: rule[1](m, d), exact: true };
    }
    return { text: d.message, exact: false };
  }

  function strings(lang) { return STRINGS[lang] || STRINGS.en; }
  function reason(text, lang) { return lang === 'fr' && REASONS[text] ? REASONS[text] : text; }

  // ------------------------------------------------------------- the page

  /** A link to the other player page, keeping ?lang= when the address has it. */
  function sibling(href, lang) {
    if (!new URLSearchParams(location.search).has('lang')) return href;
    const [path, hash] = href.split('#');
    return `${path}?lang=${lang}${hash !== undefined ? `#${hash}` : ''}`;
  }

  /**
   * Translates the static parts of the page: data-i18n (text), data-i18n-html,
   * data-i18n-title, data-i18n-aria (aria-label), data-i18n-href, and
   * data-sibling links. Marks the current button of the [data-lang-switch].
   */
  function translatePage(lang) {
    const t = strings(lang);
    document.documentElement.lang = lang;
    const each = (attr, fn) => document.querySelectorAll(`[${attr}]`).forEach((el) => fn(el, t[el.getAttribute(attr)]));
    each('data-i18n', (el, v) => { el.textContent = v; });
    each('data-i18n-html', (el, v) => { el.innerHTML = v; });
    each('data-i18n-title', (el, v) => { el.title = v; });
    each('data-i18n-aria', (el, v) => { el.setAttribute('aria-label', v); });
    each('data-i18n-href', (el, v) => { el.href = v; });
    each('data-sibling', (el) => { el.href = sibling(el.dataset.sibling, lang); });
    document.querySelectorAll('[data-lang-switch] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  /** Wires the EN/FR switch: stores the choice, and keeps ?lang= in step if the address has it. */
  function onSwitch(change) {
    document.querySelectorAll('[data-lang-switch] button').forEach((b) => b.addEventListener('click', () => {
      const lang = b.dataset.lang;
      store(lang);
      const params = new URLSearchParams(location.search);
      if (params.has('lang')) {
        params.set('lang', lang);
        try { history.replaceState(null, '', `${location.pathname}?${params}${location.hash}`); } catch { /* file:// in some browsers */ }
      }
      change(lang);
    }));
  }

  return { KEY, LANGS, STRINGS, FR_DIAGNOSTICS, pick, detect, store, strings, explain, reason, num, sibling, translatePage, onSwitch };
});
