import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CondicionIvaDTO } from '../interfaces/CondicionIvaDTO';

@Injectable({ providedIn: 'root' })
export class CondicionIvaService {
  private apiUrl = `${environment.apiUrl}/CondicionIva`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<CondicionIvaDTO[]> {
    return this.http.get<CondicionIvaDTO[]>(this.apiUrl);
  }
}
