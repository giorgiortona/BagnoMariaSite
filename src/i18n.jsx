import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const LANGUAGE_OPTIONS = [
  { value: 'it', flag: '🇮🇹', label: 'Italiano' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
]

const COPY = {
  it: {
    locale: 'it-IT',
    bookingLanguage: 'it',
    meta: {
      title: 'Bagno Maria · Lido a Santa Maria al Bagno · Puglia',
      description: 'Bagno Maria — lido, bar ed eventi a Santa Maria al Bagno, Nardò. Una piccola baia di sabbia, mare trasparente e tramonti sullo Ionio.',
    },
    common: {
      skip: 'Vai al contenuto',
      language: 'Seleziona la lingua',
      backToTop: 'Bagno Maria — torna all’inizio',
    },
    nav: {
      aria: 'Navigazione principale',
      open: 'Apri menu',
      close: 'Chiudi menu',
      links: ['La spiaggia', 'La giornata', 'Menù', 'Eventi', 'Dove siamo'],
      book: 'Prenota',
      bookLong: 'Prenota il tuo posto',
      coast: 'Costa ionica · Puglia',
    },
    hero: {
      side: <>Lido · Bar · Eventi<br />sulla costa ionica</>,
      tagline: 'Sabbia chiara · acqua cristallina',
      book: 'Prenota il tuo posto',
      discover: 'Scopri',
      sea: 'Mar Ionio',
    },
    intro: {
      videoLabel: 'La spiaggia di Santa Maria al Bagno ripresa dal drone',
      line: <>Qui il mare<br />entra <em>piano.</em></>,
      lead: 'Una lingua di sabbia chiara in un tratto di costa rocciosa. Acqua bassa, trasparente e protetta: il lusso semplice di un’insenatura cittadina.',
      facts: ['ogni giorno d’estate', 'dalla cittadina al mare', 'tramonti da ricordare'],
    },
    beach: {
      heading: <>Dal primo caffè<br />all’ultimo <em>raggio.</em></>,
      lead: 'Nessun programma rigido. Solo il tempo scandito dal sole, dal mare e da quello che ti va.',
      moments: [
        { title: 'La prima luce', text: 'Il profumo del caffè, gli ombrelloni ancora chiusi e una passerella che porta dritta al mare.', alt: 'La passerella bianca tra gli ombrelloni verso il mare' },
        { title: 'Piedi nell’acqua', text: 'Fondale basso, sabbia finissima e lettini a pochi passi dalla battigia. Qui anche i più piccoli si sentono a casa.', alt: 'Una giornata di sole e mare al Bagno Maria' },
        { title: 'Golden hour', text: 'La luce diventa calda, il ritmo rallenta e il primo calice arriva sulla sabbia.', alt: 'La spiaggia e la cittadina in una luminosa giornata estiva' },
      ],
      services: ['Ombrelloni & lettini', 'Fondale basso', 'Accesso disabili', 'Bar vista mare'],
    },
    bar: {
      words: ['sale', 'Salento', 'sole'],
      heading: <>Il Salento si mangia<br /><em>con le mani.</em></>,
      lead: 'Friselle, pomodori, olio buono. Poi cocktail, vini del territorio e il rito dell’aperitivo quando il sole tocca lo Ionio.',
      list: [
        ['Colazioni lente', 'dal mattino'],
        ['Friselle & piatti freschi', 'a pranzo'],
        ['Cocktail & vini salentini', 'al tramonto'],
      ],
      menu: 'consulta tutto il menù',
      foodAlt: 'Friselle salentine con pomodoro davanti al mare',
      caption: 'pane, pomodoro, mare',
      videoLabel: 'La preparazione di un cocktail al tramonto',
      madeIn: 'Made in',
      stamp: 'con il sole dentro',
    },
    booking: {
      calendar: 'Calendario per scegliere le date',
      previous: 'Mese precedente',
      next: 'Mese successivo',
      weekdays: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
      modalLabel: 'Prenotazione ombrellone su spiagge.it',
      modalTitle: 'Prenota il tuo ombrellone',
      close: 'Chiudi la prenotazione',
      loading: 'stiamo aprendo la mappa della spiaggia…',
      iframeTitle: 'Prenotazione ombrellone — spiagge.it',
      heading: <>Scegli i giorni.<br /><em>Il mare è già qui.</em></>,
      chooseSummary: 'Scegli il giorno di arrivo — e, se resti di più, quello di partenza.',
      oneDay: (date) => `${date} · 1 giorno di mare`,
      range: (start, end, days) => `Dal ${start} al ${end} · ${days} giorni di mare`,
      chooseUmbrella: 'Scegli l’ombrellone',
      email: 'Richiedi via email',
      emailSubject: 'Richiesta prenotazione ombrellone',
      emailNoDate: 'Buongiorno,\nvorrei informazioni per prenotare un ombrellone.\nGrazie!',
      emailOneDay: (date) => `Buongiorno,\nvorrei prenotare un ombrellone per il giorno ${date}.\nGrazie!`,
      emailRange: (start, end, days) => `Buongiorno,\nvorrei prenotare un ombrellone dal ${start} al ${end} (${days} giorni).\nGrazie!`,
      orbit: 'sole · mare · relax · ',
    },
    events: {
      heading: <>Ci sono sere che<br />restano <em>addosso.</em></>,
      lead: 'Quando l’ultimo ombrellone si chiude, la spiaggia resta a voi: tre modi per prendervela tutta.',
      cta: 'Immagina il tuo evento',
      posterAlt: 'Festa degli sposi al Bagno Maria',
      posterSmall: 'non vediamo l’ora di organizzare',
      posterTitle: 'Il tuo evento in spiaggia',
      proposals: [
        ['Matrimoni in spiaggia', 'Il sì con i piedi nella sabbia e lo Ionio a fare da testimone. Allestiamo la spiaggia, il rito e la cena: voi pensate solo a guardarvi.'],
        ['Aperitivi al tramonto', 'Il rito che ci riesce meglio. Calici, musica bassa e il sole che scende dietro l’isola — anche per gruppi, su prenotazione.'],
        ['Feste private', 'Compleanni, lauree, serate danzanti. Dopo l’ultimo ombrellone chiuso la spiaggia diventa vostra, fino a notte.'],
      ],
    },
    gallery: {
      heading: <>Un po’ di Salento<br />da portare <em>con te.</em></>,
      lead: 'Trascina per attraversare la nostra estate.',
      aria: 'Galleria fotografica',
      items: [
        ['Il bar', 'Un momento al bar del lido'],
        ['La spiaggia', 'La spiaggia di Bagno Maria affacciata sul borgo di Santa Maria al Bagno'],
        ['La cala', 'La cala di acqua cristallina ripresa dal drone'],
        ['Estate', 'La spiaggia in una giornata d’estate'],
      ],
    },
    contact: {
      heading: <>Sei già<br /><em>quasi qui.</em></>,
      maps: 'Apri in Google Maps',
      where: 'Dove',
      when: 'Quando',
      everyDay: 'Tutti i giorni',
      season: 'Stagione estiva',
      talk: 'Parliamone',
      mapTitle: 'Mappa — Bagno Maria, Santa Maria al Bagno',
    },
    footer: { up: 'Torna su ↑' },
    preloader: { loading: 'Loading mare…', coast: 'Santa Maria al Bagno · costa ionica' },
    menu: {
      aria: 'Menù completo Bagno Maria',
      legend: 'Legenda alimentare',
      vegetarian: 'Vegetariano',
      vegan: 'Vegano',
    },
  },
  en: {
    locale: 'en-GB',
    bookingLanguage: 'en',
    meta: {
      title: 'Bagno Maria · Beach club in Santa Maria al Bagno · Puglia',
      description: 'Bagno Maria — beach club, bar and events in Santa Maria al Bagno, Nardò. A small sandy bay, clear sea and Ionian sunsets.',
    },
    common: { skip: 'Skip to content', language: 'Select language', backToTop: 'Bagno Maria — back to top' },
    nav: {
      aria: 'Main navigation', open: 'Open menu', close: 'Close menu',
      links: ['The beach', 'The day', 'Menu', 'Events', 'Find us'],
      book: 'Book', bookLong: 'Book your spot', coast: 'Ionian coast · Puglia',
    },
    hero: {
      side: <>Beach club · Bar · Events<br />on the Ionian coast</>,
      tagline: 'Soft sand · crystal-clear water', book: 'Book your spot', discover: 'Discover', sea: 'Ionian Sea',
    },
    intro: {
      videoLabel: 'Aerial view of the beach at Santa Maria al Bagno',
      line: <>Here the sea<br />rolls in <em>gently.</em></>,
      lead: 'A strip of pale sand along a rocky coastline. Shallow, clear and sheltered water: the simple luxury of a bay in the heart of town.',
      facts: ['every summer day', 'from the town to the sea', 'sunsets to remember'],
    },
    beach: {
      heading: <>From the first coffee<br />to the last <em>ray.</em></>,
      lead: 'No rigid schedule. Just time marked by the sun, the sea and whatever you feel like doing.',
      moments: [
        { title: 'First light', text: 'The aroma of coffee, umbrellas still closed and a walkway leading straight to the sea.', alt: 'The white walkway between the beach umbrellas and the sea' },
        { title: 'Feet in the water', text: 'Shallow water, fine sand and loungers just steps from the shoreline. Even the little ones feel at home here.', alt: 'A sunny day by the sea at Bagno Maria' },
        { title: 'Golden hour', text: 'The light turns warm, the pace slows down and the first glass arrives on the sand.', alt: 'The beach and town on a bright summer day' },
      ],
      services: ['Umbrellas & loungers', 'Shallow water', 'Accessible beach', 'Sea-view bar'],
    },
    bar: {
      words: ['salt', 'Salento', 'sun'],
      heading: <>Salento tastes best<br /><em>eaten by hand.</em></>,
      lead: 'Friselle, tomatoes and good olive oil. Then cocktails, local wines and the aperitivo ritual as the sun meets the Ionian Sea.',
      list: [['Slow breakfasts', 'from morning'], ['Friselle & fresh dishes', 'at lunch'], ['Cocktails & Salento wines', 'at sunset']],
      menu: 'view the full menu', foodAlt: 'Salento friselle with tomato by the sea', caption: 'bread, tomato, sea',
      videoLabel: 'A cocktail being prepared at sunset', madeIn: 'Made in', stamp: 'with sunshine inside',
    },
    booking: {
      calendar: 'Calendar for choosing dates', previous: 'Previous month', next: 'Next month',
      weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      modalLabel: 'Beach umbrella booking on spiagge.it', modalTitle: 'Book your beach umbrella', close: 'Close booking',
      loading: 'opening the beach map…', iframeTitle: 'Beach umbrella booking — spiagge.it',
      heading: <>Choose your days.<br /><em>The sea is already here.</em></>,
      chooseSummary: 'Choose your arrival day — and your departure day if you are staying longer.',
      oneDay: (date) => `${date} · 1 day by the sea`,
      range: (start, end, days) => `From ${start} to ${end} · ${days} days by the sea`,
      chooseUmbrella: 'Choose your umbrella', email: 'Request by email', emailSubject: 'Beach umbrella booking request',
      emailNoDate: 'Hello,\nI would like information about booking a beach umbrella.\nThank you!',
      emailOneDay: (date) => `Hello,\nI would like to book a beach umbrella for ${date}.\nThank you!`,
      emailRange: (start, end, days) => `Hello,\nI would like to book a beach umbrella from ${start} to ${end} (${days} days).\nThank you!`,
      orbit: 'sun · sea · relax · ',
    },
    events: {
      heading: <>Some evenings<br /><em>stay with you.</em></>,
      lead: 'When the last umbrella closes, the beach is yours: three ways to enjoy it all.', cta: 'Imagine your event',
      posterAlt: 'Wedding celebration at Bagno Maria', posterSmall: 'we cannot wait to organise', posterTitle: 'Your event on the beach',
      proposals: [
        ['Beach weddings', 'Say “I do” with your feet in the sand and the Ionian Sea as your witness. We arrange the beach, ceremony and dinner; you only have to look at each other.'],
        ['Sunset aperitifs', 'The ritual we do best. Glasses, soft music and the sun setting behind the island — also for groups, by reservation.'],
        ['Private parties', 'Birthdays, graduations and dancing nights. After the last umbrella closes, the beach is yours until late.'],
      ],
    },
    gallery: {
      heading: <>A little Salento<br />to take <em>with you.</em></>, lead: 'Drag to travel through our summer.', aria: 'Photo gallery',
      items: [
        ['The bar', 'A moment at the beach bar'],
        ['The beach', 'Bagno Maria beach overlooking Santa Maria al Bagno'], ['The cove', 'The crystal-clear cove seen from above'],
        ['Summer', 'The beach on a summer day'],
      ],
    },
    contact: {
      heading: <>You are<br /><em>almost here.</em></>, maps: 'Open in Google Maps', where: 'Where', when: 'When',
      everyDay: 'Every day', season: 'Summer season', talk: 'Get in touch', mapTitle: 'Map — Bagno Maria, Santa Maria al Bagno',
    },
    footer: { up: 'Back to top ↑' },
    preloader: { loading: 'Loading the sea…', coast: 'Santa Maria al Bagno · Ionian coast' },
    menu: { aria: 'Full Bagno Maria menu', legend: 'Dietary key', vegetarian: 'Vegetarian', vegan: 'Vegan' },
  },
  fr: {
    locale: 'fr-FR',
    bookingLanguage: 'fr',
    meta: {
      title: 'Bagno Maria · Plage privée à Santa Maria al Bagno · Pouilles',
      description: 'Bagno Maria — plage privée, bar et événements à Santa Maria al Bagno, Nardò. Une petite baie de sable, une mer transparente et des couchers de soleil sur la mer Ionienne.',
    },
    common: { skip: 'Aller au contenu', language: 'Choisir la langue', backToTop: 'Bagno Maria — retour en haut' },
    nav: {
      aria: 'Navigation principale', open: 'Ouvrir le menu', close: 'Fermer le menu',
      links: ['La plage', 'La journée', 'Menu', 'Événements', 'Nous trouver'],
      book: 'Réserver', bookLong: 'Réservez votre place', coast: 'Côte ionienne · Pouilles',
    },
    hero: {
      side: <>Plage privée · Bar · Événements<br />sur la côte ionienne</>,
      tagline: 'Sable clair · eau cristalline', book: 'Réservez votre place', discover: 'Découvrir', sea: 'Mer Ionienne',
    },
    intro: {
      videoLabel: 'La plage de Santa Maria al Bagno vue du ciel',
      line: <>Ici, la mer<br />entre <em>doucement.</em></>,
      lead: 'Une langue de sable clair sur une côte rocheuse. Une eau peu profonde, transparente et abritée : le luxe simple d’une baie au cœur du village.',
      facts: ['tous les jours d’été', 'du village à la mer', 'des couchers de soleil inoubliables'],
    },
    beach: {
      heading: <>Du premier café<br />au dernier <em>rayon.</em></>,
      lead: 'Aucun programme rigide. Seulement le temps rythmé par le soleil, la mer et vos envies.',
      moments: [
        { title: 'Première lumière', text: 'Le parfum du café, les parasols encore fermés et une passerelle qui mène droit à la mer.', alt: 'La passerelle blanche entre les parasols et la mer' },
        { title: 'Les pieds dans l’eau', text: 'Eau peu profonde, sable très fin et transats à quelques pas du rivage. Ici, les plus petits se sentent aussi chez eux.', alt: 'Une journée ensoleillée au bord de la mer à Bagno Maria' },
        { title: 'L’heure dorée', text: 'La lumière se réchauffe, le rythme ralentit et le premier verre arrive sur le sable.', alt: 'La plage et le village pendant une lumineuse journée d’été' },
      ],
      services: ['Parasols & transats', 'Eau peu profonde', 'Plage accessible', 'Bar avec vue sur mer'],
    },
    bar: {
      words: ['sel', 'Salento', 'soleil'],
      heading: <>Le Salento se savoure<br /><em>avec les mains.</em></>,
      lead: 'Friselle, tomates et bonne huile d’olive. Puis cocktails, vins locaux et le rituel de l’apéritif lorsque le soleil touche la mer Ionienne.',
      list: [['Petits-déjeuners tranquilles', 'dès le matin'], ['Friselle & plats frais', 'au déjeuner'], ['Cocktails & vins du Salento', 'au coucher du soleil']],
      menu: 'voir tout le menu', foodAlt: 'Friselle du Salento à la tomate face à la mer', caption: 'pain, tomate, mer',
      videoLabel: 'La préparation d’un cocktail au coucher du soleil', madeIn: 'Créé dans le', stamp: 'avec le soleil à l’intérieur',
    },
    booking: {
      calendar: 'Calendrier pour choisir les dates', previous: 'Mois précédent', next: 'Mois suivant',
      weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
      modalLabel: 'Réservation de parasol sur spiagge.it', modalTitle: 'Réservez votre parasol', close: 'Fermer la réservation',
      loading: 'ouverture du plan de la plage…', iframeTitle: 'Réservation de parasol — spiagge.it',
      heading: <>Choisissez vos jours.<br /><em>La mer est déjà là.</em></>,
      chooseSummary: 'Choisissez votre jour d’arrivée — et votre jour de départ si vous restez plus longtemps.',
      oneDay: (date) => `${date} · 1 journée à la mer`,
      range: (start, end, days) => `Du ${start} au ${end} · ${days} jours à la mer`,
      chooseUmbrella: 'Choisir le parasol', email: 'Demander par e-mail', emailSubject: 'Demande de réservation de parasol',
      emailNoDate: 'Bonjour,\nje voudrais des informations pour réserver un parasol.\nMerci !',
      emailOneDay: (date) => `Bonjour,\nje voudrais réserver un parasol pour le ${date}.\nMerci !`,
      emailRange: (start, end, days) => `Bonjour,\nje voudrais réserver un parasol du ${start} au ${end} (${days} jours).\nMerci !`,
      orbit: 'soleil · mer · détente · ',
    },
    events: {
      heading: <>Il y a des soirées<br />qui restent <em>en vous.</em></>,
      lead: 'Lorsque le dernier parasol se ferme, la plage est à vous : trois façons d’en profiter pleinement.', cta: 'Imaginez votre événement',
      posterAlt: 'Fête de mariage à Bagno Maria', posterSmall: 'nous avons hâte d’organiser', posterTitle: 'Votre événement sur la plage',
      proposals: [
        ['Mariages sur la plage', 'Dites « oui » les pieds dans le sable avec la mer Ionienne pour témoin. Nous préparons la plage, la cérémonie et le dîner ; vous n’avez plus qu’à vous regarder.'],
        ['Apéritifs au coucher du soleil', 'Le rituel que nous maîtrisons le mieux. Verres, musique douce et soleil qui descend derrière l’île — également pour les groupes, sur réservation.'],
        ['Fêtes privées', 'Anniversaires, remises de diplôme et soirées dansantes. Une fois le dernier parasol fermé, la plage est à vous jusqu’à tard.'],
      ],
    },
    gallery: {
      heading: <>Un peu de Salento<br />à emporter <em>avec vous.</em></>, lead: 'Faites glisser pour parcourir notre été.', aria: 'Galerie de photos',
      items: [
        ['Le bar', 'Un moment au bar de la plage'],
        ['La plage', 'La plage de Bagno Maria face au village de Santa Maria al Bagno'], ['La crique', 'La crique aux eaux cristallines vue du ciel'],
        ['Été', 'La plage pendant une journée d’été'],
      ],
    },
    contact: {
      heading: <>Vous êtes<br /><em>presque ici.</em></>, maps: 'Ouvrir dans Google Maps', where: 'Où', when: 'Quand',
      everyDay: 'Tous les jours', season: 'Saison estivale', talk: 'Contactez-nous', mapTitle: 'Carte — Bagno Maria, Santa Maria al Bagno',
    },
    footer: { up: 'Retour en haut ↑' },
    preloader: { loading: 'Chargement de la mer…', coast: 'Santa Maria al Bagno · côte ionienne' },
    menu: { aria: 'Menu complet de Bagno Maria', legend: 'Légende alimentaire', vegetarian: 'Végétarien', vegan: 'Végan' },
  },
}

const LanguageContext = createContext(null)

function initialLanguage() {
  if (typeof window === 'undefined') return 'it'
  const saved = window.localStorage.getItem('bagnomaria-language')
  if (COPY[saved]) return saved
  const browserLanguage = window.navigator.language?.slice(0, 2).toLowerCase()
  return COPY[browserLanguage] ? browserLanguage : 'it'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage)
  const copy = COPY[language]

  useEffect(() => {
    window.localStorage.setItem('bagnomaria-language', language)
    document.documentElement.lang = language
    document.title = copy.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.meta.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', copy.meta.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', copy.meta.description)
  }, [copy, language])

  const value = useMemo(() => ({ language, setLanguage, copy }), [copy, language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage deve essere usato dentro LanguageProvider')
  return value
}
