import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Comprueba si el usuario está autenticado Y si su rol es 'admin'.
  if (authService.isAuthenticated() && authService.getUserRole() === 'admin') {
    return true; // Si es admin, permite el acceso.
  }

  // Si no es admin, lo redirige a la página de selección de faenas (o al login si no está autenticado)
  // y bloquea el acceso a la ruta de admin.
  router.navigate(['/select-faena']);
  return false;
};
