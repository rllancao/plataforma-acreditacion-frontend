import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas públicas y estáticas: Se pre-renderizan en la compilación (SSG)
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'olvidaste-pass', renderMode: RenderMode.Prerender },

  // Rutas dinámicas o protegidas: Se renderizan en el servidor en el momento de la petición (SSR)
  { path: 'select-faena', renderMode: RenderMode.Server },
  { path: 'dashboard/:id', renderMode: RenderMode.Server },
  { path: 'trabajador/:id', renderMode: RenderMode.Server },
  { path: 'admin', renderMode: RenderMode.Server },
  { path: 'admin/ingresar-faena', renderMode: RenderMode.Server },
  { path: 'admin/ingresar-empresa', renderMode: RenderMode.Server },
  { path: 'admin/ingresar-trabajador', renderMode: RenderMode.Server },

  // Rutas de fallback también se renderizan en el servidor
  { path: '**', renderMode: RenderMode.Server },
];
