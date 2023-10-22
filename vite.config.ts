import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { InlineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = (p: string) => {
  return fileURLToPath(new URL(p, import.meta.url))
}

const config: InlineConfig = {
  root: root('src/renderer'),
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
    tsconfigPaths({ root: root('src/renderer') }),
  ],
  build: {
    modulePreload: {
      polyfill: false,
    },
    outDir: root('dist'),
    emptyOutDir: true,
    watch: process.argv.includes('-w') ? {} : undefined,
  },
}

export default config
