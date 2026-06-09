import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';


export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);
  const token = auth.token;

  // El agente local de posnet (127.0.0.1) NO es nuestra API: no le mandamos el JWT.
  // Si lo hiciéramos, el header Authorization dispara un preflight CORS que el agente
  // no necesita responder, y rompería la detección de la estación.
  if (!token || req.url.includes('127.0.0.1')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
