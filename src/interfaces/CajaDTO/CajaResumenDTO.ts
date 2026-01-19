export interface CajaResumenDTO {
    cajaId: number;

    fechaApertura: string;
    fechaCierre: string;

    montoInicial: number;
    totalVentas: number;
    retiros: number;
    ingresosExtra: number;

    montoCierre: number;
}
