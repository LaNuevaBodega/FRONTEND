import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { PagoPosnetService } from '../../../Service/pago-posnet-service';
import {
  CobroEstadoDTO,
  EstadoCobro,
  TipoCobroPosnet,
} from '../../../interfaces/Posnet/CobroDTO';

export interface DatosCobroPosnet {
  metodoPagoId: number;
  tipo: TipoCobroPosnet;
  monto: number;
  cuotas?: number;
}

/** Resultado que el diálogo devuelve al cerrarse con éxito. */
export interface ResultadoCobroPosnet {
  cobroId: number;
  codigoAutorizacion?: string | null;
  referencia?: string | null;
  ultimos4?: string | null;
  marca?: string | null;
}

@Component({
  selector: 'app-dialog-cobro-posnet',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-cobro-posnet.html',
  styleUrl: './dialog-cobro-posnet.scss',
})
export class DialogCobroPosnet implements OnInit, OnDestroy {
  EstadoCobro = EstadoCobro;
  TipoCobroPosnet = TipoCobroPosnet;

  cobroId: number | null = null;
  estado: EstadoCobro = EstadoCobro.Pendiente;
  mensajeError: string | null = null;
  estacionId: string | null = null;
  /** true mientras consultamos al agente local en qué estación estamos. */
  detectando = true;
  sinPosnet = false;

  private subs = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<DialogCobroPosnet>,
    private pagoService: PagoPosnetService,
    @Inject(MAT_DIALOG_DATA) public data: DatosCobroPosnet
  ) {
    // No se puede cerrar tocando afuera mientras el posnet trabaja.
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // Primero averiguamos en qué PC física está el cajero (y si tiene posnet).
    this.pagoService.detectarEstacion().subscribe((info) => {
      this.detectando = false;
      if (!info || !info.disponible) {
        this.sinPosnet = true;
        this.estado = EstadoCobro.Error;
        this.mensajeError = 'Esta PC no tiene un posnet configurado.';
        return;
      }
      this.estacionId = info.estacionId;
      this.iniciarCobro();
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private iniciarCobro(): void {
    this.estado = EstadoCobro.Pendiente;
    this.mensajeError = null;

    this.pagoService
      .iniciar({
        metodoPagoId: this.data.metodoPagoId,
        tipo: this.data.tipo,
        monto: this.data.monto,
        cuotas: this.data.cuotas ?? 1,
        estacionId: this.estacionId ?? undefined,
      })
      .subscribe({
        next: (estado) => {
          this.cobroId = estado.id;
          this.aplicarEstado(estado);
          this.escuchar(estado.id);
        },
        error: (err) => {
          this.estado = EstadoCobro.Error;
          this.mensajeError =
            err?.error ?? 'No se pudo iniciar el cobro en el posnet.';
        },
      });
  }

  /** Suscribe al empuje SignalR + polling de respaldo cada 2s contra el backend. */
  private async escuchar(cobroId: number): Promise<void> {
    const stream$ = await this.pagoService.seguirCobro(cobroId);
    this.subs.add(
      stream$.subscribe((estado) => {
        if (estado.id === cobroId) this.aplicarEstado(estado);
      })
    );

    this.subs.add(
      interval(2000).subscribe(() => {
        if (this.esEstadoFinal()) return;
        this.pagoService
          .obtenerEstado(cobroId)
          .subscribe((estado) => this.aplicarEstado(estado));
      })
    );
  }

  private aplicarEstado(estado: CobroEstadoDTO): void {
    if (this.esEstadoFinal()) return; // ya cerramos, ignorar tardíos
    this.estado = estado.estado;
    this.mensajeError = estado.mensajeError ?? null;

    if (estado.estado === EstadoCobro.Aprobado) {
      const resultado: ResultadoCobroPosnet = {
        cobroId: estado.id,
        codigoAutorizacion: estado.codigoAutorizacion,
        referencia: estado.referencia,
        ultimos4: estado.ultimos4,
        marca: estado.marca,
      };
      // Pequeño respiro para que el cajero vea el "Aprobado".
      setTimeout(() => this.dialogRef.close(resultado), 800);
    }
  }

  private esEstadoFinal(): boolean {
    return (
      this.estado === EstadoCobro.Aprobado ||
      this.estado === EstadoCobro.Rechazado ||
      this.estado === EstadoCobro.Cancelado ||
      this.estado === EstadoCobro.Error
    );
  }

  get esperando(): boolean {
    return (
      this.estado === EstadoCobro.Pendiente ||
      this.estado === EstadoCobro.EnCurso
    );
  }

  reintentar(): void {
    this.cobroId = null;
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.iniciarCobro();
  }

  cancelar(): void {
    if (this.cobroId && this.esperando) {
      this.pagoService.cancelar(this.cobroId).subscribe();
    }
    this.dialogRef.close(null);
  }
}
