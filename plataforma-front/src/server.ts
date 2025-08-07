import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
// ✅ CORRECCIÓN: El motor se inicializa sin argumentos.
const angularApp = new AngularNodeAppEngine();

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
  // Rutas que son dinámicas y deben ser renderizadas en el servidor, no pre-renderizadas.
  const dynamicRoutes = [
    '/dashboard/',
    '/trabajador/',
    '/select-faena',
    '/admin'
  ];

  // Se comprueba si la URL actual comienza con alguna de las rutas dinámicas.
  const isDynamicRoute = dynamicRoutes.some(route => req.originalUrl.startsWith(route));

  angularApp
    // ✅ CORRECCIÓN: Las opciones de renderizado se pasan al método 'handle'.
    .handle(req, {
      renderMode: isDynamicRoute ? 'server' : 'prerender'
    })
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 8000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
