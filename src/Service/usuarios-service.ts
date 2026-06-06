import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CajeroDTO, CrearCajeroDTO, EditarCajeroDTO } from '../interfaces/CajeroDTO/CajeroDTO';
import { AuthResponse } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // 👤 Cajeros activos (con máquina asignada)
  obtenerCajerosActivos(): Observable<CajeroDTO[]> {
    return this.http.get<CajeroDTO[]>(`${this.apiUrl}/cajeros-activos`);
  }

  // 👥 Todos los cajeros/administradores (configuración)
  obtenerTodos(): Observable<CajeroDTO[]> {
    return this.http.get<CajeroDTO[]>(`${this.apiUrl}/todos`);
  }

  crear(dto: CrearCajeroDTO): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/crear-cajero`, dto);
  }

  editar(dto: EditarCajeroDTO): Observable<void> {
    return this.http.put<void>(this.apiUrl, dto);
  }

  desactivar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🖥️ El admin se autoasigna una máquina; el backend devuelve un token nuevo.
  asignarMiMaquina(maquinaId: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/mi-maquina`, { maquinaId });
  }
}
