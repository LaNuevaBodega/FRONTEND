import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { MetodoPagoDTO } from '../interfaces/MetodoDePagoDTO/MetodoPagoDTO';

@Injectable({
  providedIn: 'root',
})
export class MetodoDePagoService {

   private apiUrl = `${environment.apiUrl}/MetodoDePago`;

  constructor(private http: HttpClient) {}

   obtenerActivos(): Observable<MetodoPagoDTO[]> {
    return this.http.get<MetodoPagoDTO[]>(`${this.apiUrl}/activos`);
  }
  
}
