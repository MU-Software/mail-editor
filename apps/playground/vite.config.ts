import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so the build works when served from a GitHub Pages
  // project subpath (https://<user>.github.io/mail-editor/) as well as locally.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@playground': resolve(__dirname, 'src'),
      '@mu-software/mail-editor': resolve(__dirname, '../../packages/mail-editor/src'),
    },
  },
})
