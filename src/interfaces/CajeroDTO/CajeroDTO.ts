export interface CajeroDTO {
    id: string;
    userName: string;
    email: string;
    maquinaId: string | null;
    activo: boolean;
    rol: string;
}

export interface CrearCajeroDTO {
    userName: string;
    email: string;
    password: string;
    maquinaId: string | null;
}

export interface EditarCajeroDTO {
    usuarioId: string;
    maquinaId: string | null;
    activo: boolean;
}
