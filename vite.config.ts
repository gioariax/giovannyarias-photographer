import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
// @ts-expect-error The Vercel middleware is shared with the local Vite server.
import esgrimaProxy from './proxy.js'

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
  server.middlewares.use(async (request, response, next) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    if (!/^\/esgrima(?:\/|$|\.html$)/.test(url.pathname)) return next()

    try {
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(Buffer.from(chunk))
      const method = request.method || 'GET'
      const result: Response = await esgrimaProxy(new Request(url, {
        method,
        headers: new Headers(Object.entries(request.headers).flatMap(([key, value]) =>
          value === undefined ? [] : [[key, Array.isArray(value) ? value.join(', ') : value]],
        )),
        ...(!['GET', 'HEAD'].includes(method) ? { body: Buffer.concat(chunks) } : {}),
      }))

      if (result.headers.has('x-middleware-next')) {
        request.url = request.url?.replace(/^\/esgrima\/?(?=\?|$)/, '/esgrima.html')
        return next()
      }
      response.statusCode = result.status
      result.headers.forEach((value, key) => response.setHeader(key, value))
      response.end(Buffer.from(await result.arrayBuffer()))
    } catch (error) {
      next(error)
    }
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
