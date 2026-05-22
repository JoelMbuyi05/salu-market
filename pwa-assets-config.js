import { defineConfig, minimalPreset as preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  head: true,
  preset,
  images: ['public/icon-512.png']
})