import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoDTO } from '../interfaces/ProductoDTO';
import { CreacionProductoDTO } from '../interfaces/CreacionProductoDTO';
import { EdicionProductoDTO } from '../interfaces/EdicionProductoDTO';
import { BalanzaDecodificadaDTO } from '../interfaces/BalanzaDecodificadaDTO';
import { environment } from '../environments/environment';
import { PagedResult } from '../interfaces/PagedResult';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = `${environment.apiUrl}/Producto`;

  constructor(private http: HttpClient) { }


  obtenerTodos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}`);
  }

  obtenerPorId(id: number): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CreacionProductoDTO): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: EdicionProductoDTO): Observable<ProductoDTO> {
    return this.http.put<ProductoDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  buscarProductoPorCodigo(codigo: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/buscar/${codigo}`);
  }

  // Lookup exacto contra la vista (precio/stock reales). Usado por el escaneo del mostrador.
  buscarEnVistaPorCodigo(codigo: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/vista/buscar/${encodeURIComponent(codigo)}`);
  }

  obtenerPaginado(pagina: number, pageSize: number, termino: string = "") {
    return this.http.get<PagedResult<ProductoDTO>>(`${this.apiUrl}/paginado`, {
      params: { pagina, pageSize, termino }
    });
  }

  decodificarBalanza(barcode: string): Observable<BalanzaDecodificadaDTO> {
    return this.http.get<BalanzaDecodificadaDTO>(`${this.apiUrl}/balanza/${barcode}`);
  }

  obtenerGranel(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/granel`);
  }

  exportarPlu(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar-plu`, { responseType: 'blob' });
  }

}







