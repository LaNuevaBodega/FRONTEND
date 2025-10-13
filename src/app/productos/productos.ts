import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
// Módulos de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

// SweetAlert2
import Swal from 'sweetalert2'; 
import { ProductoService } from '../../Service/producto-service';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { DialogProducto } from '../dialog/dialog-producto/dialog-producto';
import { CreacionProductoDTO } from '../../interfaces/CreacionProductoDTO';
import { EdicionProductoDTO } from '../../interfaces/EdicionProductoDTO';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';

// Importaciones de DTOs y Servicios (Ajusta rutas si es necesario)


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
     CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos implements OnInit {

  searchControl = new FormControl('');
  productos: ProductoDTO[] = []; // Todos los productos (16k)
  productosMostrados: ProductoDTO[] = []; // Productos visibles (chunk + filtro)
  productoSeleccionado: ProductoDTO | null = null;

  bloque = 50; // Cantidad a cargar por vez
  indice = 0; // Índice del siguiente bloque
  terminoBusquedaActual: string = ''; 

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarTodosLosProductos();

    // Lógica de filtrado y scroll infinito
    this.searchControl.valueChanges.subscribe(term => {
      this.terminoBusquedaActual = term?.toLowerCase() || '';
      this.aplicarFiltro();
    });
  }
  
  cargarTodosLosProductos(): void {
    // Solo se llama al inicio para traer todo el catálogo (16k)
    this.productoService.obtenerTodos().subscribe(result => {
      this.productos = result;
      this.aplicarFiltro(); // Carga el primer bloque
    });
  }

  aplicarFiltro(): void {
    const valor = this.terminoBusquedaActual;

    if (valor) {
      // 1. Filtrar en la lista completa
      this.productosMostrados = this.productos
        .filter(p => 
          p.nombre.toLowerCase().includes(valor) || 
          p.codigo.toLowerCase().includes(valor)
        );
      this.indice = this.productosMostrados.length; // Detiene el scroll infinito
    } else {
      // 2. Si no hay filtro, aplicamos scroll infinito
      this.productosMostrados = this.productos.slice(0, this.bloque);
      this.indice = this.bloque;
    }
    this.productoSeleccionado = null;
  }
  
  cargarMas() {
    if (this.terminoBusquedaActual !== '') {
      return;
    }
    
    const siguienteBloque = this.productos.slice(this.indice, this.indice + this.bloque);
    this.productosMostrados = [...this.productosMostrados, ...siguienteBloque];
    this.indice += this.bloque;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      if (this.terminoBusquedaActual === '' && this.indice < this.productos.length) {
        this.cargarMas();
      }
    }
  }

  seleccionarProducto(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
  }
  
  // --- LÓGICA DE ABM (Abre el Modal) ---
  
  abrirDialogo(producto?: ProductoDTO): void {
    const dialogoRef = this.dialog.open(DialogProducto, {
      width: '600px',
      data: producto
    });

    dialogoRef.afterClosed().subscribe((resultado: EdicionProductoDTO | undefined) => {
      if (resultado) {
        this.procesarResultado(resultado, producto);
      }
    });
  }

  procesarResultado(data: EdicionProductoDTO, productoExistente?: ProductoDTO): void {
    let obs: Observable<any>;
    let titulo: string;

    if (productoExistente && productoExistente.id) {
      obs = this.productoService.actualizar(productoExistente.id, data);
      titulo = '¡Actualización Exitosa!';
    } else {
      obs = this.productoService.crear(data as any); 
      titulo = '¡Creación Exitosa!';
    }

    obs.subscribe({
      next: () => {
        // La operación fue exitosa, recargamos la lista optimizada
        this.cargarTodosLosProductos(); 
        Swal.fire(titulo, 'El producto se guardó correctamente.', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Ocurrió un error en la operación de guardado.';
        Swal.fire('Error', errorMsg, 'error');
      }
    });
  }

  eliminarProducto(producto: ProductoDTO): void {
    if (!producto.id) return;

    Swal.fire({
      title: `¿Eliminar ${producto.nombre}?`,
      text: "¡Esta acción es irreversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && producto.id) {
        this.productoService.eliminar(producto.id).subscribe({
          next: () => {
            this.cargarTodosLosProductos(); // Recarga la lista
            Swal.fire('Eliminado', `El producto ${producto.nombre} ha sido eliminado.`, 'success');
          },
          error: (err) => {
            const errorMsg = err.error?.error || 'No se pudo eliminar el producto.';
            Swal.fire('Error', errorMsg, 'error');
          }
        });
      }
    });
  }


}