import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.getUserRole() === 'superAdmin') {
    return true;
  }

  // Si no es superAdmin, redirige al login
  router.navigate(['/login']);
  return false;
};
