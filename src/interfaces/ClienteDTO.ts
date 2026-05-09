export interface ClienteDTO {
  id: number;
  razonSocial: string;
  cuit: string | null;
  domicilio: string | null;
  email: string | null;
  condicionIvaId: number;
  condicionIvaNombre: string;
  claseComprobante: string;
}

export interface CrearClienteDTO {
  razonSocial: string;
  cuit: string | null;
  domicilio: string | null;
  email: string | null;
  condicionIvaId: number;
}

export interface EditarClienteDTO {
  razonSocial: string;
  cuit: string | null;
  domicilio: string | null;
  email: string | null;
  condicionIvaId: number;
}
