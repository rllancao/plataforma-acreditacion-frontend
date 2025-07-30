import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Interceptor funcional que añade el token JWT a las peticiones salientes,
 * verificando si se ejecuta en el navegador antes de acceder a localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Solo ejecutar esta lógica en el navegador
  if (isPlatformBrowser(platformId)) {
    console.log(`[Interceptor] Interceptando petición a: ${req.url}`);
    // ✅ CORRECCIÓN: Si la petición ya tiene una cabecera de autorización,
    // no hacer nada y dejarla pasar. Esto es para casos especiales como el token de reseteo.
    if (req.headers.has('Authorization')) {
      console.log('[Interceptor] La petición ya tiene una cabecera de autorización. Se dejará pasar sin modificar.');
      return next(req);
    }

    // Si no hay cabecera, intentar añadir el token de login desde localStorage
    const token = localStorage.getItem('access_token');

    if (token) {
      console.log('[Interceptor] No se encontró cabecera de autorización. Se añadirá el token del localStorage.');
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedRequest);
    } else {
      console.log('[Interceptor] No hay cabecera de autorización ni token en localStorage.');
    }
  }

  // Si estamos en el servidor o no hay token, enviar la petición original
  return next(req);
};
