import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuditoriaDTO, AuditoriaFiltro } from '../interfaces/AuditoriaDTO/AuditoriaDTO';
import { PagedResult } from '../interfaces/PagedResult';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {

  private apiUrl = `${environment.apiUrl}/auditoria`;

  constructor(private http: HttpClient) {}

  consultar(filtro: AuditoriaFiltro): Observable<PagedResult<AuditoriaDTO>> {
    const params: any = {
      pagina: filtro.pagina,
      pageSize: filtro.pageSize,
    };
    if (filtro.entidad) params.entidad = filtro.entidad;
    if (filtro.accion) params.accion = filtro.accion;
    if (filtro.usuario) params.usuario = filtro.usuario;
    if (filtro.desde) params.desde = filtro.desde;
    if (filtro.hasta) params.hasta = filtro.hasta;

    return this.http.get<PagedResult<AuditoriaDTO>>(this.apiUrl, { params });
  }

  entidades(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/entidades`);
  }
}
