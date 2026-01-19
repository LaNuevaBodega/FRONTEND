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


}

