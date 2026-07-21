# Graph Report - .  (2026-07-16)

## Corpus Check
- Corpus is ~5,173 words - fits in a single context window. You may not need a graph.

## Summary
- 55 nodes · 115 edges · 7 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Identita e navigazione
- Esperienza di prenotazione
- Composizione della pagina
- Hero spiaggia e movimento
- Bar e decorazioni marine
- Galleria fotografica
- Introduzione e sole

## God Nodes (most connected - your core abstractions)
1. `motionDisabled()` - 9 edges
2. `VideoLoop()` - 6 edges
3. `Alone()` - 5 edges
4. `Prenota()` - 4 edges
5. `App()` - 3 edges
6. `WaveBorder()` - 3 edges
7. `Hero()` - 3 edges
8. `LogoMark()` - 3 edges
9. `Logo()` - 3 edges
10. `Preloader()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `motionDisabled()`  [EXTRACTED]
  src/App.jsx → src/lib/motion.js
- `Preloader()` --calls--> `motionDisabled()`  [EXTRACTED]
  src/components/Preloader.jsx → src/lib/motion.js
- `Hero()` --calls--> `motionDisabled()`  [EXTRACTED]
  src/components/Hero.jsx → src/lib/motion.js
- `VideoLoop()` --calls--> `motionDisabled()`  [EXTRACTED]
  src/components/VideoLoop.jsx → src/lib/motion.js

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "Identita e navigazione"
Cohesion: 0.25
Nodes (7): WaveBorder(), Footer(), Logo(), LogoMark(), LINKS, Nav(), Preloader()

### Community 1 - "Esperienza di prenotazione"
Cohesion: 0.31
Nodes (9): BookingModal(), Calendario(), formatta(), GIORNI, isoLocale(), MESI, oggi, Prenota() (+1 more)

### Community 2 - "Composizione della pagina"
Cohesion: 0.33
Nodes (4): App(), Contatti(), Eventi(), ProssimiEventi()

### Community 3 - "Hero spiaggia e movimento"
Cohesion: 0.42
Nodes (5): Gabbiani(), Hero(), Spiaggia(), VideoLoop(), motionDisabled()

### Community 4 - "Bar e decorazioni marine"
Cohesion: 0.33
Nodes (3): Bar(), MareScena(), Tramonto()

### Community 5 - "Galleria fotografica"
Cohesion: 0.40
Nodes (4): GrecaBorder(), DUP_PHOTOS, Gallery(), PHOTOS

### Community 6 - "Introduzione e sole"
Cohesion: 0.50
Nodes (3): Alone(), SoleLineArt(), Intro()

## Knowledge Gaps
- **6 isolated node(s):** `PHOTOS`, `DUP_PHOTOS`, `LINKS`, `MESI`, `GIORNI` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Prenota()` connect `Esperienza di prenotazione` to `Composizione della pagina`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `motionDisabled()` connect `Hero spiaggia e movimento` to `Identita e navigazione`, `Composizione della pagina`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Alone()` connect `Introduzione e sole` to `Esperienza di prenotazione`, `Hero spiaggia e movimento`, `Bar e decorazioni marine`, `Galleria fotografica`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `PHOTOS`, `DUP_PHOTOS`, `LINKS` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._