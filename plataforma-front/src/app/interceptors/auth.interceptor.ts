import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Interceptor funcional que añade el token JWT a las peticiones salientes,
 * verificando si se ejecuta en el navegador antes de acceder a localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inyectar PLATFORM_ID para saber en qué entorno estamos
  const platformId = inject(PLATFORM_ID);

  // 2. Verificar si estamos en un navegador
  if (isPlatformBrowser(platformId)) {
    // Este código solo se ejecuta en el navegador
    const token = localStorage.getItem('access_token');

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedRequest);
    }
  }

  // 3. Si estamos en el servidor (SSR) o no hay token, enviar la petición original
  return next(req);
};
