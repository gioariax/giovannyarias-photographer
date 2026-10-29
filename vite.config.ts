import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const modelDirectories = [
  ['eye-models', fileURLToPath(new URL('./node_modules/webgazer/src/mediapipe/face_mesh/', import.meta.url))],
]

async function serveTrackingModels(server: Pick<ViteDevServer, 'middlewares'>) {
  for (const [prefix, directory] of modelDirectories) {
    const files = new Set(await readdir(directory))
    server.middlewares.use(`/${prefix}/`, (request, response, next) => {
      const name = request.url?.split('?')[0].slice(1)
      if (!name || !files.has(name)) return next()
      readFile(`${directory}/${name}`).then((data) => {
        response.setHeader('Content-Type', name.endsWith('.js') ? 'application/javascript' : name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream')
        response.end(data)
      }).catch(next)
    })
  }
}

// Match Vercel's project-specific HTML rewrite in development and preview.
function serveEsgrimaPage(server: Pick<ViteDevServer, 'middlewares'>) {
  server.middlewares.use((request, _response, next) => {
    request.url = request.url?.replace(/^\/esgrima\/?(?=\?|$)/, '/esgrima.html')
    next()
  })
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'esgrima-page',
      configureServer: serveEsgrimaPage,
      configurePreviewServer: serveEsgrimaPage,
    },
    {
      name: 'local-tracking-models',
      configureServer: serveTrackingModels,
      async generateBundle() {
        for (const [prefix, directory] of modelDirectories) {
          for (const name of await readdir(directory)) {
            if (!/\.(js|wasm|data|binarypb)$/.test(name)) continue
            this.emitFile({ type: 'asset', fileName: `${prefix}/${name}`, source: await readFile(`${directory}/${name}`) })
          }
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        esgrima: 'esgrima.html',
      },
    },
  },
})
