import { CrearVentaDetalleDTO } from "./CrearVentaDetalleDTO";

export interface CrearVentaDTO {
  pagos: {
    metodoPagoId: number;
    monto: number;
  }[];
  detalles: {
    productoId: number;
    cantidad: number;
  }[];
}