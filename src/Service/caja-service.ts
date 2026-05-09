import { Injectable } from '@angular/core';
import { CajaDTO } from '../interfaces/CajaDTO/CajaDTO';
import { Observable } from 'rxjs';
import { CerrarCajaDTO } from '../interfaces/CajaDTO/CerrarCajaDTO';
import { AbrirCajaDTO } from '../interfaces/CajaDTO/AbrirCajaDTO';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CajaService {

  private apiUrl = `${environment.apiUrl}/Caja`;

  cajaActual: CajaDTO | null = null;

  constructor(private http: HttpClient) { }

  obtenerCajaAbierta(): Observable<CajaDTO> {
    return this.http.get<CajaDTO>(`${this.apiUrl}/abierta`);
  }

  abrirCaja(montoInicial: number): Observable<CajaDTO> {
    return this.http.post<CajaDTO>(`${this.apiUrl}/abrir`, {
      montoInicial
    });
  }

  cerrarCaja(): Observable<CajaDTO> {
    return this.http.post<CajaDTO>(`${this.apiUrl}/cerrar`, {});
  }

  obtenerMaquinas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/maquinas`);
  }

  retirar(monto: number, motivo: string) {
    return this.http.post(`${this.apiUrl}/retiro`, { monto, motivo });
  }

  obtenerHistorial(cajaId: number, desde: string, hasta: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/historial/${cajaId}?desde=${desde}&hasta=${hasta}`
    );
  }

  obtenerHistorialPorMaquina(desde: string, hasta: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/historial-maquina?desde=${desde}&hasta=${hasta}`
    );
  }

  obtenerHistorialAdmin(maquinaId: string | null, desde: string, hasta: string): Observable<any[]> {
    const params = maquinaId
      ? `maquinaId=${encodeURIComponent(maquinaId)}&desde=${desde}&hasta=${hasta}`
      : `desde=${desde}&hasta=${hasta}`;
    return this.http.get<any[]>(`${this.apiUrl}/historial-admin?${params}`);
  }

  obtenerUltimoCierre(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ultimo-cierre`);
  }

  obtenerTicketCierre(cajaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ticket-cierre/${cajaId}`);
  }


}

