import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    /* In ascolto su tutte le interfacce, non solo localhost: così il sito è
       raggiungibile dai dispositivi sulla stessa rete (utile per provarlo
       da telefono). */
    host: true,
  },
  preview: {
    host: true,
  },
})
