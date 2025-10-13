import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoDTO } from '../interfaces/ProductoDTO';
import { CreacionProductoDTO } from '../interfaces/CreacionProductoDTO';
import { EdicionProductoDTO } from '../interfaces/EdicionProductoDTO';
import { environment } from '../environments/environment';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = `${environment.apiUrl}/Producto`;

  constructor(private http: HttpClient) {}


   obtenerTodos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}`);
  }
  
  /** Obtener producto por ID */
  obtenerPorId(id: number): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/${id}`);
  }

  /** Crear un nuevo producto */
  crear(dto: CreacionProductoDTO): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(this.apiUrl, dto);
  }

  /** Actualizar un producto */
  actualizar(id: number, dto: EdicionProductoDTO): Observable<ProductoDTO> {
    return this.http.put<ProductoDTO>(`${this.apiUrl}/${id}`, dto);
  }

  /** Eliminar un producto */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
  
}


