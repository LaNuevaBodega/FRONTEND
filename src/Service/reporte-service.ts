import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReporteResumenDTO } from '../interfaces/Reportes/ReporteResumenDTO';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {

  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  obtenerResumen(
    desde: string,
    hasta: string,
    topProductos = 10,
    usuario?: string | null,
    maquina?: string | null,
  ): Observable<ReporteResumenDTO> {
    const params: any = { desde, hasta, topProductos };

    if (usuario) params.usuario = usuario;
    if (maquina) params.maquina = maquina;

    return this.http.get<ReporteResumenDTO>(`${this.apiUrl}/resumen`, { params });
  }
}
