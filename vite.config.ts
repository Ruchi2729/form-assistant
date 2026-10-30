import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import packageJson from './package.json' with { type: 'json' }

const buildMetadata = JSON.stringify({
  version: packageJson.version,
  commit: process.env.APP_COMMIT || process.env.GITHUB_SHA || 'local',
  builtAt: new Date().toISOString(),
})

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'build-metadata',
      configureServer(server) {
        server.middlewares.use('/health', (_request, response) => {
          response.setHeader('Content-Type', 'text/plain')
          response.end('ok')
        })
        server.middlewares.use('/version.json', (_request, response) => {
          response.setHeader('Content-Type', 'application/json')
          response.setHeader('Cache-Control', 'no-store')
          response.end(buildMetadata)
        })
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: buildMetadata,
        })
      },
    },
  ],
})
