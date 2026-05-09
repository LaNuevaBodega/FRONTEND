export interface ProductoDTO {
  id: number;
  codigo: string;
  nombre: string;
  precioVenta: number;
  precioCosto: number;
  existencia?: number;
  proveedorNombre?: string;
  rubroNombre?: string;
  esVendible: boolean;
  esElaborado: boolean;
  esAGranel: boolean;
  codigoPLU?: number;
}