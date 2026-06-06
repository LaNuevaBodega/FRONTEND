import { Injectable } from '@angular/core';
import { ProveedorDTO } from '../interfaces/ProveedorDTO';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CrearProveedorDTO } from '../interfaces/CrearProveedorDTO';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private apiUrl = `${environment.apiUrl}/Proveedor`;


  constructor(private http:HttpClient){}

  obtenerTodos(): Observable<ProveedorDTO[]> {
    return this.http.get<ProveedorDTO[]>(`${this.apiUrl}`);
  }

  // Proveedores reales de Movi (los que usa el ABM de productos).
  obtenerMovi(): Observable<ProveedorDTO[]> {
    return this.http.get<ProveedorDTO[]>(`${this.apiUrl}/movi`);
  }

  obtenerPorId(id:number):Observable<ProveedorDTO>{
    return this.http.get<ProveedorDTO>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CrearProveedorDTO):Observable<ProveedorDTO>{
    return this.http.post<ProveedorDTO>(this.apiUrl,dto)
  }

  editar(id:number, dto: CrearProveedorDTO): Observable<ProveedorDTO>{
    return this.http.put<ProveedorDTO>(`${this.apiUrl}/${id}`, dto )
  }

  eliminar(id:number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`)
  }
  
}
