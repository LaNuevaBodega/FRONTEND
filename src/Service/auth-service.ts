import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../environments/environment';

export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expira: string;
  userName: string;
  email: string;
  roles: string[];
}

export interface TokenPayload {
  sub: string;
  unique_name: string;
  email: string;
  maquinaId?: string;
  role: string[] | string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'access_token';

  constructor(private http: HttpClient) { }

  // 🔐 LOGIN
  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          localStorage.setItem(this.tokenKey, res.token);
        })
      );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        // solo si el backend permite
        localStorage.removeItem(this.tokenKey);
      })
    );


  }


  forceLogout() {
    localStorage.removeItem(this.tokenKey);
  }

  // Reemplaza el token vigente (p. ej. tras autoasignarse una máquina).
  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  // 🔑 TOKEN
  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }


  // 👤 USER
  get userName(): string {
    return this.payload?.unique_name ?? '';
  }

  get email(): string {
    return this.payload?.email ?? '';
  }

  // 🖥️ MAQUINA
  get maquinaId(): string {
    return this.payload?.maquinaId ?? 'SIN-MAQUINA';
  }

  // 🎭 ROLES
  get roles(): string[] {
    const payload: any = this.payload;
    if (!payload) return [];

    // casos posibles
    const role =
      payload.role ??
      payload.roles ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!role) return [];

    return Array.isArray(role) ? role : [role];
  }


  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  get isAdmin(): boolean {
    return this.hasRole('Administrador');
  }

  get isEmpleado(): boolean {
    return this.hasRole('Vendedor');
  }

  // ⏱️ SESSION
  isLoggedIn(): boolean {
    if (!this.payload) return false;
    return Date.now() < this.payload.exp * 1000;
  }

  private get payload(): TokenPayload | null {
    if (!this.token) return null;
    try {
      const decoded = jwtDecode<any>(this.token);
      return decoded;
    } catch {
      return null;
    }
  }

}
