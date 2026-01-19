import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CajeroDTO } from '../interfaces/CajeroDTO/CajeroDTO';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {

   private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // 👤 Cajeros activos (admin)
  obtenerCajerosActivos(): Observable<CajeroDTO[]> {
    return this.http.get<CajeroDTO[]>(`${this.apiUrl}/cajeros-activos`);
  }
  
}
