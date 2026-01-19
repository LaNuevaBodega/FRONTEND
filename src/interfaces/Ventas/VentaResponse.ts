import { VentaDetalleResponse } from "./VentaDetalleResponse";

export interface VentaResponse {
  id: number;
  numeroVenta: number;
  fechaHora: string;
  total: number;
  metodoDePago: string;
  
  detalles?: VentaDetalleResponse[];

  cajaId: number;
}