import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado, permite el acceso.
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no, lo redirige al login y bloquea la ruta.
  router.navigate(['/login']);
  return false;
};
