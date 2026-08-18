import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Antes el Service Worker era 100% autogenerado ("generateSW", la estrategia default de este
      // plugin) — no dejaba agregar código propio. Para mostrar las notificaciones push hace falta
      // escribir el Service Worker nosotros (src/sw.ts). "injectManifest" arma ese archivo pero de
      // todos modos le inyecta la lista de archivos a cachear offline, así que no se pierde el
      // comportamiento de PWA que ya había.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        name: 'CRM Corredores',
        short_name: 'CRM Corredores',
        description: 'Asistente de bolsillo para corredores inmobiliarios',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
