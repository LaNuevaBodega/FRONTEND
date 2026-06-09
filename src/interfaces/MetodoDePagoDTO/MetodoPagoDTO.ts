export interface MetodoPagoDTO {
    id: number;
    nombre: string;
    activo: boolean;
    /** Si es true, al elegir este método se cobra por el posnet. */
    usaPosnet: boolean;
}