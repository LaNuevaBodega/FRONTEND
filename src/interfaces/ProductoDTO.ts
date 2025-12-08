export interface ProductoDTO {
  id: number;
  codigo: string;
  nombre: string;
  precioVenta: number;
  precioCosto:number;
  proveedorNombre?: string;
  rubroNombre?: string;
}