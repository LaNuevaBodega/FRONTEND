import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth-service';
import { PermisosService } from './permisos-service';

// Ruta a la que se navega para cada clave de permiso.
const RUTA_POR_CLAVE: Record<string, string> = {
  ventas: '/app/ventas',
  historial: '/app/ventas/historial',
  caja: '/app/historialcaja',
  clientes: '/app/clientes',
};

/**
 * Restringe una sección a los vendedores según la configuración del administrador.
 * Uso: { path: '...', canActivate: [PermisoGuard], data: { permiso: 'caja' } }
 * El administrador siempre pasa. Si la sección está deshabilitada para el vendedor
 * se lo redirige a la primera sección que sí tenga habilitada.
 */
export const PermisoGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const permisos = inject(PermisosService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.isAdmin) return true;

  const clave = route.data?.['permiso'] as string | undefined;
  if (!clave) return true;

  const decidir = (): boolean => {
    if (permisos.puedeVer(clave)) return true;

    const destino = permisos.primeraPermitida();
    if (destino && destino !== clave) {
      router.navigate([RUTA_POR_CLAVE[destino] ?? '/login']);
    } else {
      // El vendedor no tiene ninguna sección habilitada: lo sacamos.
      auth.forceLogout();
      router.navigate(['/login']);
    }
    return false;
  };

  if (permisos.estaCargado()) return decidir();

  // Primera navegación tras el login: cargamos la config y luego decidimos.
  return permisos.obtener().pipe(
    map(() => decidir()),
    catchError(() => of(true)),
  );
};
