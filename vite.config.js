import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.png', 'icon-512.png'],
      manifest: {
        name: 'Salu Market',
        short_name: 'Salu',
        description: 'Achète, vends. Simplement en un clic.',
        theme_color: '#1a6b3c',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '1254x1254',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '1254x1254',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})