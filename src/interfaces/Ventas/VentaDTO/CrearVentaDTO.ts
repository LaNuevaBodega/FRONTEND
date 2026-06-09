import { CrearVentaDetalleDTO } from "./CrearVentaDetalleDTO";

export interface CrearVentaDTO {
  pagos: {
    metodoPagoId: number;
    monto: number;
    /** Cobro de posnet aprobado que respalda este pago (si aplica). */
    cobroElectronicoId?: number;
  }[];
  detalles: {
    productoId: number;
    cantidad: number;
  }[];
}