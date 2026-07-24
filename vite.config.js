import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    /* Porta dedicata a questo progetto. Con la 5173 (il default di Vite)
       finivamo sulla porta di un altro sito già avviato, e il browser ci
       mostrava la sua icona e la sua cache. `strictPort` fa fallire l'avvio
       con un messaggio chiaro invece di scivolare in silenzio altrove. */
    port: Number(process.env.PORT) || 5185,
    strictPort: false,
    /* In ascolto su tutte le interfacce, non solo localhost: così il sito è
       raggiungibile dai dispositivi sulla stessa rete (utile per provarlo
       da telefono). */
    host: true,
  },
  preview: {
    port: Number(process.env.PORT) || 5181,
    strictPort: true,
    host: true,
  },
})
