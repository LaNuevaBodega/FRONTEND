export interface AuditoriaDTO {
  id: number;
  fecha: string;
  usuarioId: string | null;
  usuarioNombre: string;
  maquinaId: string | null;
  entidad: string;
  entidadId: string;
  accion: string;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
}

export interface AuditoriaFiltro {
  entidad?: string | null;
  accion?: string | null;
  usuario?: string | null;
  desde?: string | null;
  hasta?: string | null;
  pagina: number;
  pageSize: number;
}
