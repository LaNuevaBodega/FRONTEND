import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CrearVentaDTO } from '../interfaces/Ventas/VentaDTO/CrearVentaDTO';
import { VentaHistorialDTO } from '../interfaces/Ventas/VentaDTO/VentaHistorialDTO';

@Injectable({
  providedIn: 'root',
})
export class VentasService {

  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) { }

  crearVenta(dto: CrearVentaDTO) {
    return this.http.post(this.apiUrl, dto);
  }

  obtenerHistorial(
    desde: string,
    hasta: string,
    usuario?: string | null,
    maquinaId?: string | null
  ) {
    const params: any = { desde, hasta };

    if (usuario) params.usuario = usuario;
    if (maquinaId) params.maquinaId = maquinaId;

    console.log('GET historial params:', params);

    return this.http.get<VentaHistorialDTO[]>(
      `${this.apiUrl}/historial`,
      { params }
    );
  }




}
