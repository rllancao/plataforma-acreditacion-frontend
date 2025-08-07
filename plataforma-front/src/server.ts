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
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 */
// app.get('/api/**', (req, res) => { });

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
  // ✅ INICIO: Lógica de Control de Renderizado

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
    .handle(req, {
      // Si es una ruta dinámica, se renderiza en el servidor en el momento de la petición.
      // Si no, se permite que se pre-renderice durante la compilación.
      renderMode: isDynamicRoute ? 'server' : 'prerender'
    })
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
  // ✅ FIN: Lógica de Control de Renderizado
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
