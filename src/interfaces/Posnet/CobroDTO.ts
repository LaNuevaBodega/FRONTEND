// Espeja los enums/DTOs del backend (bodegaback/Modelos/DTO/PagoDTO).

export enum TipoCobroPosnet {
  Tarjeta = 1,
  Qr = 2,
}

export enum EstadoCobro {
  Pendiente = 1,
  EnCurso = 2,
  Aprobado = 3,
  Rechazado = 4,
  Cancelado = 5,
  Error = 6,
}

export interface IniciarCobroDTO {
  metodoPagoId: number;
  tipo: TipoCobroPosnet;
  monto: number;
  cuotas: number;
  /** Estación física (PC) con el posnet, descubierta vía el agente local. */
  estacionId?: string;
}

/** Lo que devuelve el agente local en 127.0.0.1 sobre la PC donde corre el front. */
export interface EstacionInfo {
  estacionId: string;
  dispositivo: string;
  disponible: boolean;
}

export interface CobroEstadoDTO {
  id: number;
  estado: EstadoCobro;
  monto: number;
  tipo: TipoCobroPosnet;
  codigoAutorizacion?: string | null;
  referencia?: string | null;
  ultimos4?: string | null;
  marca?: string | null;
  mensajeError?: string | null;
}
