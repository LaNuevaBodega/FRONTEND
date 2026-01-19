export interface CajaDTO {
    id: number;
    maquinaId: string;

    fechaApertura: string;
    fechaCierre?: string | null;

    montoInicial: number;
    montoCierre?: number | null;

    estado: 'Abierta' | 'Cerrada';
}