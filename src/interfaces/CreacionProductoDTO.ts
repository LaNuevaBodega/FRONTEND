export interface CreacionProductoDTO {
  codigo: string;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  idProveedor: number;
  idRubro: number;
  esVendible: boolean;
  esElaborado: boolean;
  esAGranel: boolean;
  codigoPLU?: number;
}