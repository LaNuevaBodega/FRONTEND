export interface MetodoPagoReporteDTO {
  metodo: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

export interface ProductoVendidoDTO {
  productoId: number;
  nombre: string;
  cantidadVendida: number;
  totalFacturado: number;
}

export interface VentaPorDiaDTO {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface VentaPorHoraDTO {
  hora: number;
  total: number;
  cantidad: number;
}

export interface CajeroReporteDTO {
  usuario: string;
  total: number;
  cantidad: number;
}

export interface ReporteResumenDTO {
  desde: string;
  hasta: string;
  totalVendido: number;
  cantidadVentas: number;
  ticketPromedio: number;
  metodosDePago: MetodoPagoReporteDTO[];
  metodoMasUtilizado: string | null;
  productosMasVendidos: ProductoVendidoDTO[];
  ventasPorDia: VentaPorDiaDTO[];
  ventasPorHora: VentaPorHoraDTO[];
  ventasPorCajero: CajeroReporteDTO[];
}
