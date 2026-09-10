# Reel di presentazione

Filmato verticale di 28.7 secondi per Instagram/TikTok: **1080 × 1920, 30 fps, senza audio**
(la musica si aggiunge in fase di pubblicazione).

Risultato: `reel/out/reel-bagnomaria.mp4`

## Il montaggio

| Tempo | Cosa si vede |
|---|---|
| 0.0 – 2.3 s | Un sup stilizzato entra dall'angolo in alto a sinistra e attraversa lo schermo in diagonale, ad andatura costante. Dietro la scia, il mare si apre e scopre il sito. |
| 2.5 – 4.0 s | Home del sito, con il video del mare che scorre davvero. |
| 4.0 – 6.0 s | Il dito scende sul menu a panino, preme, il pannello si apre e resta aperto il tempo di leggere le voci. |
| 6.0 – 6.9 s | Tocco su **Menù**; un'onda copre lo schermo e scopre la pagina del menù. |
| 6.9 – 11.2 s | Il menù in tre fermate: caffetteria, le piadine, le bevande. |
| 11.2 – 21.3 s | L'onda riporta al sito, che poi **salta di sezione in sezione** — la spiaggia, la giornata, il bar, gli eventi, la galleria, le date, i contatti — con una passata d'acqua a coprire ogni stacco. |
| 21.3 – 23.3 s | Salto alla schermata iniziale. |
| 23.3 – 28.7 s | Il mare risale e copre lo schermo; la scritta **Bagnomaria** si disegna, poi il payoff e `bagnomaria.com`. |

Il sito resta in italiano per tutto il filmato.

Il primo fotogramma ha già la punta della tavola in campo: è quello che Instagram
propone come copertina.

## Come si rigenera

Il reel non è un montaggio fatto a mano: è il **sito vero**, pilotato in un Chrome
headless e ripreso fotogramma per fotogramma. Quindi ogni volta che il sito cambia,
basta rilanciare il rendering e il filmato è aggiornato.

```bash
npm run dev                # il sito sulla porta 5185, in un altro terminale
node reel/render.mjs       # circa 7 minuti
```

Serve **ffmpeg** nel PATH e **puppeteer** raggiungibile da Node. Puppeteer non è una
dipendenza del sito (pesa circa 200 MB fra pacchetto e Chromium): installarlo dove si
preferisce e indicarne la posizione.

```bash
npm i -g puppeteer
NODE_PATH="$(npm root -g)" node reel/render.mjs
```

Variabili d'ambiente utili:

- `SITE_URL` — indirizzo del sito (default `http://localhost:5185`)
- `REEL_FRAMES` — quanti fotogrammi registrare, per provare solo l'inizio
- `REEL_WORK` — cartella di lavoro (default `reel/.cache`)

## I file

| File | A cosa serve |
|---|---|
| `render.mjs` | Pilota il browser, scatta gli 861 fotogrammi, chiama ffmpeg. |
| `overlay.js` | La regia: tempi, sup, onde, tocchi sullo schermo, cartello finale. |
| `overlay.css` | Aspetto degli elementi sovrapposti al sito. |
| `.cache/` | Fotogrammi intermedi. Si può cancellare, viene rifatta. |

Le fermate delle sezioni sono nell'elenco `JUMPS`, quelle dentro il menù in
`MENU_JUMPS`: aggiungerne o toglierne è questione di una riga.

Per ritoccare il montaggio si lavora sull'oggetto `T` in cima a `overlay.js`: sono
tutti secondi. Cambiando `DURATION` in `render.mjs` cambia la durata totale.

## Perché fotogramma per fotogramma

Una cattura in tempo reale del browser perde fotogrammi proprio dove serve fluidità
(gli stacchi a onda) e non è ripetibile. Qui invece il tempo lo decide il renderer:
`overlay.js` disegna l'istante richiesto e le transizioni CSS del sito vengono portate
a mano allo stesso istante con la Web Animations API. Lo stesso comando produce sempre
lo stesso filmato.

Il sito viene caricato con `?static`, che spegne GSAP e Lenis: le animazioni d'ingresso
resterebbero fuori sincrono. Al posto del poster fisso dell'hero vengono serviti i
fotogrammi veri di `public/media/mare-mobile.mp4`, così il mare si muove.
