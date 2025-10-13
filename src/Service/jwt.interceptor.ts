// 📁 src/app/interceptors/jwt.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';


export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const token = authService.getToken(); // Obtiene el token del localStorage

  // 1. Verificar si existe un token
  if (token) {
    // 2. Clona la petición (las peticiones HTTP son inmutables)
    //    y añade el encabezado de autorización
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    // 3. Envía la petición clonada con el token
    return next(cloned);
  }
  // 4. Si no hay token, continúa con la petición original
  return next(req);
};