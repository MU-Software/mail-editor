import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@playground': resolve(__dirname, 'src'),
      '@musoftware/mail-editor': resolve(__dirname, '../../packages/mail-editor/src'),
    },
  },
})
