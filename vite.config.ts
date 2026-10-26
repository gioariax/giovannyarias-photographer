import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"

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
