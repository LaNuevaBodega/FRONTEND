import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ActualizarPermisoDTO, PermisoVistaDTO } from '../interfaces/PermisoDTO/PermisoVistaDTO';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class PermisosService {

  private apiUrl = `${environment.apiUrl}/permisos`;

  // Claves habilitadas para los vendedores. Se llena tras cargar() del backend.
  private habilitadas = signal<Set<string>>(new Set());
  private cargado = signal(false);

  constructor(private http: HttpClient, private auth: AuthService) {}

  obtener(): Observable<PermisoVistaDTO[]> {
    return this.http.get<PermisoVistaDTO[]>(this.apiUrl).pipe(
      tap(permisos => this.aplicar(permisos))
    );
  }

  actualizar(cambios: ActualizarPermisoDTO[]): Observable<void> {
    return this.http.put<void>(this.apiUrl, cambios);
  }

  private aplicar(permisos: PermisoVistaDTO[]) {
    this.habilitadas.set(new Set(permisos.filter(p => p.habilitado).map(p => p.clave)));
    this.cargado.set(true);
  }

  estaCargado(): boolean {
    return this.cargado();
  }

  // El admin ve todo. El vendedor ve lo habilitado; mientras no se haya
  // cargado la config se asume permitido para evitar parpadeos.
  puedeVer(clave: string): boolean {
    if (this.auth.isAdmin) return true;
    if (!this.cargado()) return true;
    return this.habilitadas().has(clave);
  }

  // Primera clave habilitada para un vendedor (destino de fallback).
  primeraPermitida(): string | null {
    for (const clave of ['ventas', 'historial', 'caja', 'clientes']) {
      if (this.habilitadas().has(clave)) return clave;
    }
    return null;
  }
}
