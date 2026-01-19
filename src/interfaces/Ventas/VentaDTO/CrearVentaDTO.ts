import { CrearVentaDetalleDTO } from "./CrearVentaDetalleDTO";

export interface CrearVentaDTO {
  metodoDePagoId: number;
  detalles: CrearVentaDetalleDTO[];
}