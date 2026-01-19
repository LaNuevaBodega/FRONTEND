export interface VentaHistorialDTO {
  id: number;
  numeroVenta: number;
  fechaHora: string;   // ISO string (DateTime del backend)

  total: number;
  metodoDePago: string;

  usuario: string;    // username del cajero
  maquinaId: string;
}
