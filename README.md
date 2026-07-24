# Bagnomaria · Sito web

Sito one-page per il lido **Bagnomaria** di Santa Maria al Bagno (Nardò, LE).
Design minimale ed elegante in bianco e azzurro, foto protagoniste, animazioni GSAP.

## Stack

- **React 18 + Vite** — struttura a componenti, build veloce
- **GSAP + ScrollTrigger** — preloader animato, reveal on-scroll, parallax
- **Lenis** — smooth scrolling
- **Font**: Cormorant Garamond (titoli), Jost (testi), Nothing You Could Do (script del logo)

## Comandi

```bash
npm install     # prima volta
npm run dev     # sviluppo → http://localhost:5180
npm run build   # produzione → cartella dist/
npm run preview # anteprima della build → http://localhost:5181
```

Il progetto usa una **porta dedicata (5180)** con `strictPort`. Non è un
dettaglio estetico: con la 5173 (il default di Vite) si finiva sulla porta
di un altro sito già avviato, e il browser mostrava nella scheda l'icona e
la cache di quel progetto. Se la 5180 risulta occupata l'avvio fallisce con
un messaggio chiaro, invece di scivolare in silenzio altrove.

Per lo stesso motivo le icone hanno un nome proprio
(`favicon-bagnomaria.svg`) e non il generico `favicon.svg`.

## Struttura

| Sezione | File |
|---|---|
| Preloader (logo animato) | `src/components/Preloader.jsx` |
| Navbar | `src/components/Nav.jsx` |
| Hero full-screen | `src/components/Hero.jsx` |
| La Baia (intro) | `src/components/Intro.jsx` |
| La Spiaggia | `src/components/Spiaggia.jsx` |
| Il Bar / Aperitivi | `src/components/Bar.jsx` |
| Eventi | `src/components/Eventi.jsx` |
| Galleria | `src/components/Gallery.jsx` |
| Prenota (calendario date) | `src/components/Prenota.jsx` |
| Contatti + mappa | `src/components/Contatti.jsx` |
| Footer | `src/components/Footer.jsx` |
| Logo SVG (sole + onde) | `src/components/Logo.jsx` |
| Decorazioni estive (sole, tramonto, gabbiani, barca, bordi onda) | `src/components/Decor.jsx` |

- Le foto sono in `public/photos/` (scaricate dal sito attuale e da spiagge.it).
- Il logo storico originale è conservato in `public/photos/logo-originale.jpg`.
- I colori/typography del design system sono definiti come variabili CSS in `src/styles.css`.

## Note

- Le animazioni rispettano `prefers-reduced-motion`; con `?static` in URL si
  disattivano del tutto (utile per test e screenshot).
- Il pulsante **Prenota** porta alla sezione con il calendario: l'utente sceglie
  le date e "Scegli l'ombrellone" apre in un modal il **booking engine ufficiale
  di spiagge.it** (iframe, licenza `it-le-10119-bagnomaria`) con le date già
  precompilate; in alternativa può inviare una richiesta email.
- Nota: finché il gestore non attiva la vendita online sul suo pannello
  spiagge.it, il widget mostra "prenotazioni online non ancora aperte".
- Dati di contatto, orari e ragione sociale provengono dal sito ufficiale
  (bagnomaria.com) — da riverificare con il cliente prima della pubblicazione.
