import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject, filter } from 'rxjs';

export interface RealtimeChange<T> {
  entidad: string;
  accion: 'creado' | 'actualizado' | 'eliminado';
  payload: T;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub!: HubConnection;
  private cambios$ = new Subject<RealtimeChange<any>>();

  constructor() {
    this.iniciar();
  }

  private iniciar() {
    this.hub = new HubConnectionBuilder()
      .withUrl('https://localhost:7268/bodegaHub')
      .withAutomaticReconnect()
      .build();

    this.hub.start()
      .then(() => console.log("🔗 Conexión SignalR OK"))
      .catch(err => console.error("❌ Error SignalR:", err));

    this.hub.on('RecibirCambio', (msg: RealtimeChange<any>) => {
      this.cambios$.next(msg);
    });
  }

  cambiosDeEntidad(entidad: string) {
    return this.cambios$
      .asObservable()
      .pipe(filter(c => c.entidad === entidad));
  }
}

