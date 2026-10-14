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

  // "1", "1 to 4", "1, 3 and 5": scaffold numbers, in English and in French.
  const contiguous = (ns) => ns.length > 1 && ns.every((v, i) => !i || v === ns[i - 1] + 1);
  const scaffoldsEn = (ns) => (ns.length === 1 ? `scaffold ${ns[0]}`
    : contiguous(ns) ? `scaffolds ${ns[0]} to ${ns[ns.length - 1]}` : `scaffolds ${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`);
  const scaffoldsFr = (ns) => (ns.length === 1 ? `l'étai ${ns[0]}`
    : contiguous(ns) ? `les étais ${ns[0]} à ${ns[ns.length - 1]}` : `les étais ${ns.slice(0, -1).join(', ')} et ${ns[ns.length - 1]}`);

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
      translatedBy: (author, license) => `${author ? `translated by ${author}` : 'translated text'}${license ? ` (${license})` : ''}`,
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
      simFell: (moved, cm, n) => `Fell: ${moved} plank${s(moved)} moved, up to ${cm} cm${n ? ` (plank ${n})` : ''}.`,
      simMoving: (k, n) => `Move ${k} of ${n}…`,
      simFellRemoval: (moved) => `Fell once the scaffolding was removed${moved ? `: ${moved} plank${s(moved)} moved in the end.` : '.'}`,
      simFellScaffold: (k, moved) => `Fell during the build, once scaffold ${k} was placed${moved ? `: ${moved} plank${s(moved)} moved in the end.` : '.'}`,
      loadFailed: (url, msg) => `Could not load ${url}: ${msg}`,
      booklet: 'Booklet (PDF)',
      colours: 'Colours',
      grain: 'Wood grain',
      video: 'Video',
      legendScaffold: 'scaffold, take away after use',
      authorView: "Author's view",
      authorViewTitle: 'Turn the camera to where the author looks from',
      scaffoldsInStep: (n, later) => `${n} scaffold plank${s(n)} in this step: ${n === 1 ? 'it carries' : 'they carry'} the planks above while they go on, then ${n === 1 ? 'it comes' : 'they come'} away ${later ? 'in a later step' : 'at the end of the step'}.`,
      scaffoldsRemoved: (ns) => `Take away ${scaffoldsEn(ns)}.`,
      hintScaffold: (k, line) => `Scaffold ${k}, line ${line}`,
      hintRemove: (ns) => `Take away ${scaffoldsEn(ns)}`,
      cannotStandRemoval: 'Without its scaffolding, the construction cannot stand like this.',
      balanceFallsRemoval: 'Balance: falls when the scaffolding is removed.',
      minutes: (m) => `about ${m} min`,
      publishedAt: 'Published at',
      basedOn: 'After',
      photoAlt: 'The model, built',
      galleryAll: 'All',
      galleryTags: 'Filter by tag',
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
      galleryIntro: 'Every gallery model stands at every placement (balance check) and in a drop test, except the diving board and the leaning tower, which fall on purpose. The tent, made of leaning planks, is checked by the drop test only. Click one to open it in the player.',
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
      translatedBy: (author, license) => `${author ? `traduit par ${author}` : 'texte traduit'}${license ? ` (${license})` : ''}`,
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
      simFell: (moved, cm, n) => `Tombe : ${moved} planchette${sFr(moved)} ${moved === 1 ? 'a' : 'ont'} bougé, jusqu'à ${cm} cm${n ? ` (planchette ${n})` : ''}.`,
      simMoving: (k, n) => `Action ${k} sur ${n}…`,
      simFellRemoval: (moved) => `Tombe au retrait de l'échafaudage` +
        (moved ? ` : ${moved} planchette${sFr(moved)} ${moved === 1 ? 'a' : 'ont'} bougé au final.` : '.'),
      simFellScaffold: (k, moved) => `Tombe pendant le montage, une fois l'étai ${k} posé` +
        (moved ? ` : ${moved} planchette${sFr(moved)} ${moved === 1 ? 'a' : 'ont'} bougé au final.` : '.'),
      loadFailed: (url, msg) => `Impossible de charger ${url} : ${msg}`,
      booklet: 'Notice (PDF)',
      colours: 'Couleurs',
      grain: 'Veinage du bois',
      video: 'Vidéo',
      legendScaffold: 'étai, à retirer après usage',
      authorView: "Vue de l'auteur",
      authorViewTitle: "Tourner la caméra vers le point de vue de l'auteur",
      scaffoldsInStep: (n, later) => `${n} étai${sFr(n)} dans cette étape : ${n === 1 ? 'il porte' : 'ils portent'} les planchettes du dessus pendant la pose, puis on ${n === 1 ? 'le' : 'les'} retire ${later ? 'dans une étape suivante' : "à la fin de l'étape"}.`,
      scaffoldsRemoved: (ns) => `Retirez ${scaffoldsFr(ns)}.`,
      hintScaffold: (k, line) => `Étai ${k}, ligne ${line}`,
      hintRemove: (ns) => `Retirez ${scaffoldsFr(ns)}`,
      cannotStandRemoval: 'Sans son échafaudage, la construction ne peut pas tenir ainsi.',
      balanceFallsRemoval: "Équilibre : tombe au retrait de l'échafaudage.",
      minutes: (m) => `environ ${m} min`,
      publishedAt: 'Publié sur',
      basedOn: "D'après",
      photoAlt: 'Le modèle, construit',
      galleryAll: 'Tous',
      galleryTags: 'Filtrer par mot-clé',
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
      galleryIntro: "Chaque modèle de la galerie tient debout à chaque planchette posée (calcul d'équilibre) et au test de chute, sauf le plongeoir et la tour penchée, qui tombent exprès. La tente, en planchettes inclinées, n'est vérifiée que par le test de chute. Les modèles, leurs notices et leurs vidéos sont en français. Cliquez sur un modèle pour l'ouvrir dans le lecteur.",
      playerLink: 'Lecteur',
    },
  };

  // Reasons the balance check gives, or the player, when it does not run.
  const REASONS = {
    'the model has errors or floating planks: fix them first': 'le modèle a des erreurs ou des planchettes qui ne reposent sur rien : corrigez-les d\'abord',
    'the balance check could not start': "la vérification n'a pas pu démarrer",
    'this browser cannot run it in the background': 'ce navigateur ne peut pas la lancer en arrière-plan',
    'the model has leaning planks, which it cannot model yet: use the drop test': "le modèle a des planchettes inclinées, qu'elle ne sait pas encore traiter : faites le test de chute",
  };

  // French explanations of the diagnostics, by code. Each entry lists the
  // English messages it knows (a pattern and its translation), then a
  // general explanation built from the diagnostic's fields alone, used if
  // the English wording ever changes.
  const plank = (n, source) => `planchette ${n}${source !== undefined ? ` (${q(source)})` : ''}`;
  const Plank = (n, source) => `La ${plank(n, source)}`;
  // The plank or scaffold a diagnostic is about, from its fields.
  const Who = (d) => (d.scaffold ? `L'étai ${d.scaffold}` : Plank(d.plank));
  const listOf = (ns) => (ns.length > 8 ? `${ns.slice(0, 8).join(', ')} et ${ns.length - 8} autres` : ns.length > 1 ? `${ns.slice(0, -1).join(', ')} et ${ns[ns.length - 1]}` : `${ns[0]}`);
  // A scaffold plank (docs/proposals/scaffold.md) is an "étai" in French.
  // `kind` is the word of the English message: "plank" or "scaffold".
  const elt = (kind, n, source) => (kind === 'scaffold' ? `étai ${n}` : `planchette ${n}`) + (source !== undefined ? ` (${q(source)})` : '');
  const the = (kind, n, source) => (kind === 'scaffold' ? `l'${elt(kind, n, source)}` : `la ${elt(kind, n, source)}`);
  const The = (kind, n, source) => { const t = the(kind, n, source); return t[0].toUpperCase() + t.slice(1); };
  const placed = (kind) => (kind === 'scaffold' ? 'posé' : 'posée');
  // "scaffold 1", "scaffolds 1 to 4", "scaffolds 1, 3 and 5", from the numbers.
  const etais = (ns) => (ns.length === 1 ? `l'étai ${ns[0]}`
    : ns.every((v, i) => !i || v === ns[i - 1] + 1) ? `les étais ${ns[0]} à ${ns[ns.length - 1]}` : `les étais ${listOf(ns)}`);
  const removedFr = (ns) => `${etais(ns)} ${ns.length > 1 ? 'sont retirés' : 'est retiré'}`;
  // The scaffold numbers of "scaffold 2", "scaffolds 1 to 4", "scaffolds 1, 3 and 5".
  const numbers = (text) => {
    const range = text.match(/(\d+) to (\d+)/);
    if (range) return Array.from({ length: range[2] - range[1] + 1 }, (_, i) => Number(range[1]) + i);
    return (text.match(/\d+/g) || []).map(Number);
  };
  const MUST = {
    'an absolute https: URL': 'une adresse https: complète',
    'an absolute https: URL, or text': 'une adresse https: complète, ou du texte',
    'a date written YYYY-MM-DD': 'une date écrite AAAA-MM-JJ',
    'an https: URL, or a path next to the file (no "..")': `une adresse https:, ou un chemin à côté du fichier (sans ${q('..')})`,
    'a list of lower-case words, e.g. [castle, bridge]': 'une liste de mots en minuscules, par exemple [chateau, pont]',
    'a positive integer': 'un nombre entier positif',
  };
  const VIEW_HELP = 'une direction (front, back-left, top…) ou un azimut, puis une élévation facultative';
  const FR_DIAGNOSTICS = {
    'E-frontmatter': [
      [/^Unexpected indented line: "(.*)"$/, (m) => `Ligne indentée inattendue : ${q(m[1])}`],
      [/^Not a "key: value" line: "(.*)"$/, (m) => `Ce n'est pas une ligne ${q('clé: valeur')} : ${q(m[1])}`],
      [/^"plank" must be three positive numbers/, () => `${q('plank')} doit être trois nombres positifs, par exemple [15, 3, 1]`],
      [/^"(.*)" must be an integer$/, (m) => `${q(m[1])} doit être un nombre entier`],
      [/^"(.*)" must be a positive number$/, (m) => `${q(m[1])} doit être un nombre positif`],
      [/^"palette" must be a mapping/, () => `${q('palette')} doit associer des noms à des couleurs`],
      [/^"(.*)" must be (.*)$/, (m) => (MUST[m[2]] ? `${q(m[1])} doit être ${MUST[m[2]]}` : null)],
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
      [/^Unknown attribute "until" ignored: it only applies to scaffold lines$/, () => `Attribut ${q('until')} ignoré : il ne s'applique qu'aux lignes ${q('scaffold')}`],
      () => 'Attribut inconnu, ignoré',
    ],
    'E-duplicate-id': [
      [/^(plank|scaffold) (\d+) \("(.*)"\): id "(.*)" is already used by (plank|scaffold) (\d+)$/, (m) => `${The(m[1], m[2], m[3])} : l'identifiant ${q(m[4])} est déjà utilisé par ${the(m[5], m[6])}`],
      (d) => `${Who(d)} : cet identifiant est déjà utilisé par une autre planchette`,
    ],
    'E-below-ground': [
      [/^(plank|scaffold) (\d+) \("(.*)"\) goes below the ground \(z = (.*)\)$/, (m) => `${The(m[1], m[2], m[3])} passe sous le sol (z = ${num('fr', m[4])})`],
      (d) => `${Who(d)} passe sous le sol`,
    ],
    'E-overlap': [
      [/^(plank|scaffold) (\d+) \("(.*)"\) goes through (plank|scaffold) (\d+) \(line (\d+)\)$/, (m) => `${The(m[1], m[2], m[3])} traverse ${the(m[4], m[5])} (ligne ${m[6]})`],
      (d) => `${Who(d)} traverse ${d.otherScaffold ? `l'étai ${d.otherScaffold}` : `la planchette ${d.other}`}`,
    ],
    'W-floating': [
      [/^(plank|scaffold) (\d+) \("(.*)"\) rests on nothing when it is placed$/, (m) => `${The(m[1], m[2], m[3])} ne repose sur rien quand ${m[1] === 'scaffold' ? 'il est posé' : 'elle est posée'}`],
      (d) => `${Who(d)} ne repose sur rien quand elle est posée`,
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
      [/^(\d+) planks at once, scaffolds included, but the inventory is (\d+)$/, (m) => `${m[1]} planchettes en même temps, étais compris, mais l'inventaire n'en compte que ${m[2]}`],
      () => "Le modèle demande plus de planchettes que l'inventaire n'en compte",
    ],
    'E-translation-source': [
      [/^The "translation-of" key names no file$/, () => `La clé ${q('translation-of')} ne nomme aucun fichier`],
      [/^The original "(.*)" does not exist$/, (m) => `L'original ${q(m[1])} n'existe pas`],
      [/^The original "(.*)" is itself a translation$/, (m) => `L'original ${q(m[1])} est lui-même une traduction`],
      () => "L'original de cette traduction est introuvable",
    ],
    'E-translation-planks': [
      [/^step (\d+) of a translation has (\d+) plank lines?: /, (m) => `L'étape ${m[1]} d'une traduction a ${m[2]} ligne${m[2] === '1' ? '' : 's'} de planchettes : la géométrie vient de l'original`],
      (d) => `L'étape ${d.step} d'une traduction a des lignes de planchettes : la géométrie vient de l'original`,
    ],
    'W-translation-steps': [
      [/^(\d+) steps?, but the original "(.*)" has (\d+)$/, (m) => `${m[1]} étape${m[1] === '1' ? '' : 's'}, mais l'original ${q(m[2])} en a ${m[3]}`],
      () => "La traduction n'a pas le même nombre d'étapes que l'original",
    ],
    'W-translation-lang': [
      [/^A translation has no "lang"$/, () => `La traduction n'a pas de ${q('lang')}`],
      [/^"lang" is "(.*)", the language of the original$/, (m) => `${q('lang')} vaut ${q(m[1])}, la langue de l'original`],
      () => "La langue de la traduction manque, ou c'est celle de l'original",
    ],
    'W-translation-ignored-key': [
      [/^"(.*)" is ignored in a translation: /, (m) => `${q(m[1])} est ignoré dans une traduction : il vient de l'original`],
      () => "Cette clé est ignorée dans une traduction : elle vient de l'original",
    ],
    'W-translation-stale': [
      [/^The text of the original "(.*)" has changed since this translation: check it, then set "source-hash" to (\S+)$/,
        (m) => `Le texte de l'original ${q(m[1])} a changé depuis cette traduction : vérifiez-la, puis mettez ${q('source-hash')} à ${m[2]}`],
      () => "Le texte de l'original a changé depuis cette traduction",
    ],
    'E-lean': [
      [/^Invalid lean "(.*)": /, (m) => `Inclinaison invalide ${q(m[1])} : attendu <direction>:<degrés>, la direction parmi +x, -x, +y, -y et l'angle entre 0 et 90, par exemple -x:20`],
      () => "Inclinaison invalide : attendu <direction>:<degrés>, par exemple -x:20",
    ],
    'W-view': [
      [/^Invalid view "(.*)": /, (m) => `Vue invalide ${q(m[1])} : attendu ${VIEW_HELP}, par exemple back-left,20`],
      [/^Expected key=value after "plank", got "(.*)"$/, (m) => `Attendu clé=valeur après ${q('plank')}, trouvé ${q(m[1])}`],
      [/^Invalid zoom "(.*)": /, (m) => `Zoom invalide ${q(m[1])} : attendu un nombre positif`],
      [/^Invalid focus "(.*)": /, (m) => `Cadrage invalide ${q(m[1])} : attendu ${q('step')} ou l'identifiant d'une planchette`],
      [/^Step (\d+): focus "(.*)" names no plank placed by the end of the step$/, (m) => `Étape ${m[1]} : le cadrage ${q(m[2])} ne nomme aucune planchette posée avant la fin de l'étape`],
      () => 'Indication de vue invalide, ignorée',
    ],
    'W-scaffold-release': [
      [/^scaffold (\d+) \("(.*)"\): "until" names (?:the scaffold "(.*)": .*|no plank: there is no id "(.*)"|plank (\d+), which is placed before it)\. It is removed at the end of step (\d+)$/, (m) => {
        const why = m[3] !== undefined ? `${q('until')} nomme l'étai ${q(m[3])} : un étai est libéré par une planchette de la construction`
          : m[4] !== undefined ? `${q('until')} ne nomme aucune planchette : il n'y a pas d'identifiant ${q(m[4])}`
            : `${q('until')} nomme la planchette ${m[5]}, qui est posée avant lui`;
        return `L'${elt('scaffold', m[1], m[2])} : ${why}. Il est retiré à la fin de l'étape ${m[6]}`;
      }],
      (d) => `L'étai ${d.scaffold} : ${q('until')} ne nomme pas une planchette posée après lui. Il est retiré à la fin de son étape`,
    ],
    'W-scaffold-floating': [
      [/^(plank|scaffold) (\d+) \("(.*)"\) rests on nothing once (.*) (?:is|are) removed$/, (m) => `${The(m[1], m[2], m[3])} ne repose plus sur rien quand ${removedFr(numbers(m[4]))}`],
      (d) => `${d.scaffold ? `L'étai ${d.scaffold}` : `La planchette ${d.plank}`} ne repose plus sur rien quand l'échafaudage est retiré`,
    ],
    'W-scaffold-wedged': [
      [/^scaffold (\d+) \("(.*)"\) carries (plank|scaffold) (\d+) and has planks against it on every side: it cannot slide out$/,
        (m) => `L'${elt('scaffold', m[1], m[2])} porte ${the(m[3], m[4])} et a des planchettes contre lui de tous les côtés : il ne peut pas glisser hors de la construction`],
      (d) => `L'étai ${d.scaffold} est coincé de tous les côtés : il ne peut pas glisser hors de la construction`,
    ],
    'I-unchecked-lean': [
      // Built from the fields.
      (d) => `La vérification de l'équilibre ne sait pas encore traiter les planchettes inclinées (${d.scaffold ? `l'étai ${d.scaffold} est incliné` : `la planchette ${d.plank} est inclinée`}) : faites le test de chute pour voir si la construction tient.`,
    ],
    'I-unstable': [
      // Built from the fields: the planks that give way are all in `failing`,
      // the scaffolds in `failingScaffolds`. A fall may start or end at a
      // scaffold placed (`kind` 'scaffold') or removed ('remove').
      (d) => {
        const toEnd = !/It stands again afterwards/.test(d.message || '');
        const kind = d.kind || 'plank', untilKind = d.untilKind || 'plank';
        const one = d.move !== undefined ? d.move === d.untilMove : d.plank === d.until;
        const name = (k, n, removed = []) => (k === 'remove' ? `le retrait ${etais(removed).replace(/^les /, 'des ').replace(/^l'/, "de l'")}` : the(k, n));
        const first = name(kind, kind === 'scaffold' ? d.scaffold : d.plank, d.removed);
        const last = () => name(untilKind, untilKind === 'scaffold' ? d.untilScaffold : d.until, d.untilRemoved || d.removed || []);
        const de = (t) => t.replace(/^le /, 'du ').replace(/^la /, 'de la ').replace(/^l'/, "de l'");
        const a = (t) => t.replace(/^le /, 'au ').replace(/^la /, 'à la ').replace(/^l'/, "à l'");
        const span = toEnd
          ? (one ? (kind === 'remove' ? `Quand ${removedFr(d.removed)}` : `Quand ${the(kind, kind === 'scaffold' ? d.scaffold : d.plank)} est ${placed(kind)}`) : `À partir ${de(first)}`)
          : (one ? (kind === 'remove' ? `Juste après ${a(first).replace(/^au /, 'le ')}` : `Tant que ${first} est ${kind === 'scaffold' ? 'le dernier posé' : 'la dernière posée'}`) : `${de(first).replace(/^d/, 'D')} ${a(last())}`);
        const failing = d.failing || [], scaffolds = d.failingScaffolds || [];
        const who = failing.length
          ? (failing.length > 1 ? ` (les planchettes ${listOf(failing)} ne peuvent pas rester en équilibre)` : ` (la planchette ${failing[0]} ne peut pas rester en équilibre)`)
          : scaffolds.length ? ` (${etais(scaffolds)} ${scaffolds.length > 1 ? 'ne peuvent' : 'ne peut'} pas rester en équilibre)` : '';
        return `${span}, la construction tombe${who}.` + (kind === 'remove' ? " Elle ne tient pas seule sans l'échafaudage." : '') +
          (toEnd ? '' : " Elle tient de nouveau ensuite : tenez-la, ou changez l'ordre de pose.");
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
      const text = m ? rule[1](m, d) : null;
      if (text !== null) return { text, exact: true };
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
