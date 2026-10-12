import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    svgr(),
    command === 'serve' &&
      checker({
        typescript: { buildMode: true },
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          useFlatConfig: true,
        },
        overlay: { initialIsOpen: false },
      }),
  ],
}))
