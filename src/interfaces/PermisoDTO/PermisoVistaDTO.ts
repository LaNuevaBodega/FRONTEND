export interface PermisoVistaDTO {
    id: number;
    clave: string;
    etiqueta: string;
    habilitado: boolean;
}

export interface ActualizarPermisoDTO {
    id: number;
    habilitado: boolean;
}
