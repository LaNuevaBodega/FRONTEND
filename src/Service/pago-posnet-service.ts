import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../environments/environment';
import { catchError, of } from 'rxjs';
import {
  CobroEstadoDTO,
  EstacionInfo,
  IniciarCobroDTO,
} from '../interfaces/Posnet/CobroDTO';

/**
 * Cliente del cobro por posnet. Combina dos canales:
 *   - HTTP: iniciar / cancelar / estado (polling de respaldo) contra api/PagosPosnet.
 *   - SignalR (posnetHub): empuje en vivo del estado del cobro mientras el cliente paga.
 *
 * El POS NO habla con el posnet: solo dispara la orden y escucha el resultado.
 */
@Injectable({ providedIn: 'root' })
export class PagoPosnetService {
  private apiUrl = `${environment.apiUrl}/PagosPosnet`;
  // El hub vive en la raíz del backend, no bajo /api.
  private hubUrl = environment.apiUrl.replace(/\/api\/?$/, '') + '/posnetHub';

  // El agente local expone su identidad en loopback de ESTA PC.
  private discoveryUrl =
    (environment as any).posnetDiscoveryUrl ?? 'http://127.0.0.1:9099';

  private hub?: HubConnection;
  private actualizaciones$ = new Subject<CobroEstadoDTO>();

  constructor(private http: HttpClient) {}

  /**
   * Pregunta al agente local en qué estación física está corriendo este front.
   * Devuelve null si en esta PC no hay agente/posnet (ej. PC sin posnet).
   */
  detectarEstacion(): Observable<EstacionInfo | null> {
    return this.http
      .get<EstacionInfo>(`${this.discoveryUrl}/estacion`)
      .pipe(catchError(() => of(null)));
  }

  iniciar(dto: IniciarCobroDTO): Observable<CobroEstadoDTO> {
    return this.http.post<CobroEstadoDTO>(`${this.apiUrl}/iniciar`, dto);
  }

  cancelar(cobroId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${cobroId}/cancelar`, {});
  }

  obtenerEstado(cobroId: number): Observable<CobroEstadoDTO> {
    return this.http.get<CobroEstadoDTO>(`${this.apiUrl}/${cobroId}/estado`);
  }

  /** Conecta al hub (si no lo está) y se suscribe a las novedades de un cobro puntual. */
  async seguirCobro(cobroId: number): Promise<Observable<CobroEstadoDTO>> {
    await this.asegurarConexion();
    await this.hub!.invoke('SuscribirCobro', cobroId);
    return this.actualizaciones$.asObservable();
  }

  private async asegurarConexion(): Promise<void> {
    if (this.hub && this.hub.state === 'Connected') return;

    if (!this.hub) {
      this.hub = new HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .withAutomaticReconnect()
        .build();

      this.hub.on('CobroActualizado', (estado: CobroEstadoDTO) => {
        this.actualizaciones$.next(estado);
      });
    }

    if (this.hub.state === 'Disconnected') {
      await this.hub.start();
    }
  }
}
