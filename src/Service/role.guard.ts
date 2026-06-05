import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';

/**
 * Protege rutas según el rol del usuario.
 * Uso en app.routes.ts:
 *   { path: 'reportes', component: Reportes, canActivate: [RoleGuard], data: { roles: ['Administrador'] } }
 * Si el usuario no tiene ninguno de los roles requeridos se lo redirige al Mostrador.
 */
export const RoleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const rolesRequeridos = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (rolesRequeridos.length === 0 || rolesRequeridos.some(r => auth.hasRole(r))) {
    return true;
  }

  // Logueado pero sin permisos: lo mandamos a su pantalla principal.
  router.navigate(['/app/ventas']);
  return false;
};
