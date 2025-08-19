import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

const apiUrl = process.env['API_URL'];

if (apiUrl) {
  app.use('/api', createProxyMiddleware({
    target: apiUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
    // ✅ CORRECCIÓN: Los eventos ahora van dentro de un objeto 'on'
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Redirigiendo ${req.method} a ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
      }
    }
  }));
}

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 10000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler.
 */
export const reqHandler = createNodeRequestHandler(app);
