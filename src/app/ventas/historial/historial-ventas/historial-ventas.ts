import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VentasService } from '../../../../Service/ventas-service';
import { VentaHistorialDTO } from '../../../../interfaces/Ventas/VentaDTO/VentaHistorialDTO';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../../../Service/usuarios-service';
import { CajaService } from '../../../../Service/caja-service';
import { AuthService } from '../../../../Service/auth-service';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.scss',
})
export class HistorialVentas implements OnInit {

  desde!: string;
  hasta!: string;

  usuarioSeleccionado: string | null = null;
  maquinaSeleccionada: string | null = null;

  usuarios: string[] = [];
  maquinas: string[] = [];

  esAdmin = false; 

  ventas: VentaHistorialDTO[] = [];
  cargando = false;

  constructor(private ventasService: VentasService,
    private usuarioService: UsuariosService,
    private cajaService: CajaService,
    private authService: AuthService

  ) { }


  ngOnInit(): void {
    
    this.esAdmin = this.authService.isAdmin;

    console.log('HistorialVentas INIT');
    console.log('Rol admin:', this.esAdmin);

    if (this.esAdmin) {
      // 👑 ADMIN: carga selects
      this.usuarioService.obtenerCajerosActivos().subscribe(u => {
        console.log('Cajeros activos:', u);
        this.usuarios = u.map(x => x.userName);
      });

      this.cajaService.obtenerMaquinas().subscribe(m => {
        console.log('Máquinas:', m);
        this.maquinas = m;
      });
    } else {
      // 👤 VENDEDOR: fijo por token
      this.usuarioSeleccionado = this.authService.userName;
      this.maquinaSeleccionada = this.authService.maquinaId;

      console.log('Usuario fijo:', this.usuarioSeleccionado);
      console.log('Máquina fija:', this.maquinaSeleccionada);
    }
  }


  buscar() {
    if (!this.desde || !this.hasta) {
      console.warn('Fechas incompletas');
      return;
    }

    console.log('BUSCAR HISTORIAL');
    console.log('Desde:', this.desde);
    console.log('Hasta:', this.hasta);
    console.log('Usuario seleccionado:', this.usuarioSeleccionado);
    console.log('Máquina seleccionada:', this.maquinaSeleccionada);

    this.cargando = true;

    this.ventasService.obtenerHistorial(
      this.desde,
      this.hasta,
      this.usuarioSeleccionado,
      this.maquinaSeleccionada
    ).subscribe({
      next: v => {
        console.log('Ventas recibidas:', v);
        this.ventas = v;
        this.cargando = false;
      },
      error: err => {
        console.error('Error historial:', err);
        this.cargando = false;
      }
    });
  }


  get totalDia() {
    return this.ventas.reduce((sum, v) => sum + v.total, 0);
  }

}
