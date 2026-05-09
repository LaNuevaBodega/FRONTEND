export interface EdicionProductoDTO {
  nombre: string;
  codigo: string;
  precioCosto: number;
  precioVenta: number;
  idProveedor: number;
  idRubro: number;
  esVendible: boolean;
  esElaborado: boolean;
  esAGranel: boolean;
  codigoPLU?: number;
}