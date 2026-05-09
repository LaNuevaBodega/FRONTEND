import { VentaPagoResumenDTO } from "./VentaPagoResumenDTO";

export interface VentaHistorialDTO {
   id: number;
  numeroVenta: number;
  fechaHora: string;
  total: number;
  metodoDePago: string;
  usuario: string;
  maquinaId: string;
  pagos: VentaPagoResumenDTO[];
}
