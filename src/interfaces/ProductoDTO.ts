export interface ProductoDTO {
  id: number;
  codigo: string;
  nombre: string;
  precioVenta: number;
  proveedorNombre?: string;
  rubroNombre?: string;
}