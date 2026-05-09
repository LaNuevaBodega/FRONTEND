import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimientoStock } from '../interfaces/StockDTO/MovimientoStock';
import { AjusteStockDTO } from '../interfaces/StockDTO/AjusteStockDTO';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  
  private apiUrl = `${environment.apiUrl}/stock`;


  constructor(private http: HttpClient) { }

  ajustar(productoId: number, dto: AjusteStockDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajustar/${productoId}`, dto);
  }

  movimientos(productoId: number): Observable<MovimientoStock[]> {
    return this.http.get<MovimientoStock[]>(`${this.apiUrl}/movimientos/${productoId}`);
  }


}
