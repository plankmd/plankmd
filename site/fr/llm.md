---
title: Écrire du PlankMD avec un LLM
description: Un prompt système prêt à l'emploi pour faire écrire des modèles PlankMD valides et constructibles par un modèle de langage
---

# Écrire du PlankMD avec un LLM

Cette page donne un prompt système prêt à l'emploi pour un modèle de langage
qui écrit des fichiers `.plank.md`. Collez le prompt ci-dessous comme prompt
système (ou comme premier message), puis demandez une construction. Il se
suffit à lui-même : le modèle n'a pas besoin de lire toute la
[spécification](/fr/spec).

Le prompt est en anglais, et c'est voulu : les modèles de langage le suivent
très bien, et il reste identique d'une langue à l'autre. Vous pouvez demander
la construction en français, et préciser que le texte du livret doit être en
français (`lang: fr` dans le frontmatter).

Le prompt demande au modèle de calculer chaque coordonnée avant d'écrire,
c'est là que les modèles se trompent le plus souvent. Passez le résultat au
validateur et renvoyez-lui les diagnostics : ils donnent le numéro de la
planchette et la ligne, ce qui suffit au modèle pour corriger ses erreurs.

```bash
npx plankmd validate model.plank.md --physics
```

`--physics` vérifie aussi que la construction tient après chaque planchette,
et indique quelle inclinaison elle supporte : visez au moins 5°.

::: tip Fichiers bruts pour les modèles de langage
Le prompt est servi en Markdown brut à
[`/docs/llm-instructions.md`](/docs/llm-instructions.md){target="_self"}, la
spec à [`/SPEC.md`](/SPEC.md){target="_self"}, et
[`/llms.txt`](/llms.txt){target="_self"} indexe le site pour les modèles de
langage.
:::

## Le prompt (en anglais)

<!--@include: ../../docs/llm-instructions.md{24,}-->
