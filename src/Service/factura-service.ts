import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface SolicitarFacturaDTO {
  ventaId: number;
  clienteId: number;
}

export interface FacturaResponseDTO {
  id: number;
  ventaId: number;
  numeroVenta: number;
  clienteRazonSocial: string;
  clienteCuit: string;
  tipoComprobante: number;
  tipoComprobanteNombre: string;
  numeroComprobante: number;
  emisorRazonSocial: string;
  emisorCuit: string;
  emisorDomicilio: string | null;
  puntoDeVenta: number;
  cae: string;
  caeFechaVto: string;
  fechaEmision: string;
}

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/Factura`;

  constructor(private http: HttpClient) {}

  solicitar(dto: SolicitarFacturaDTO): Observable<FacturaResponseDTO> {
    return this.http.post<FacturaResponseDTO>(this.apiUrl, dto);
  }

  // Recupera la factura ya emitida de una venta (404 si no fue facturada).
  obtenerPorVenta(ventaId: number): Observable<FacturaResponseDTO> {
    return this.http.get<FacturaResponseDTO>(`${this.apiUrl}/venta/${ventaId}`);
  }
}
