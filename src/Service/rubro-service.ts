import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RubroDTO } from '../interfaces/RubroDTO';
import { CrearRubroDTO } from '../interfaces/CrearRubroDTO';

@Injectable({
  providedIn: 'root'
})
export class RubroService {

  private apiUrl = `${environment.apiUrl}/Rubro`;

  constructor(private http: HttpClient) {

  }

  obtenerTodos(): Observable<RubroDTO[]> {
    return this.http.get<RubroDTO[]>(`${this.apiUrl}`);
  }

  obtenerPorId(id: number): Observable<RubroDTO> {
    return this.http.get<RubroDTO>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CrearRubroDTO): Observable<RubroDTO> {
    return this.http.post<RubroDTO>(this.apiUrl, dto);
  }

  editar(id: number, dto: CrearRubroDTO): Observable<RubroDTO> {
    return this.http.put<RubroDTO>(`${this.apiUrl}/${id}`, dto)
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }


}
