import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-180px.png', 'icon-192.png', 'icon-512.png'],
      manifest: false, // usamos o arquivo público manifest.webmanifest
      workbox: {
        // Cache do shell da aplicação (assets estáticos)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Rotas SPA: navegar para qualquer rota serve o index.html
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/kcx-studio/],
        // Estratégia: stale-while-revalidate para assets
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
        ],
      },
      devOptions: {
        enabled: false, // não ativar SW em dev (evita conflitos)
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
  },
})
