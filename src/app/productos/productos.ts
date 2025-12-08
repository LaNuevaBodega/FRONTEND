import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { ProductoService } from '../../Service/producto-service';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { DialogProducto } from '../dialog/dialog-producto/dialog-producto';
import { EdicionProductoDTO } from '../../interfaces/EdicionProductoDTO';
import { PagedResult } from '../../interfaces/PagedResult';

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
  styleUrls: ['./productos.scss']
})
export class Productos implements OnInit {

  @ViewChild('scrollContenedor') scrollContenedor!: ElementRef<HTMLDivElement>;

  productos: ProductoDTO[] = [];
  productosMostrados: ProductoDTO[] = [];
  productoSeleccionado: ProductoDTO | null = null;

  pagina = 1;
  pageSize = 200;
  totalRegistros = 0;
  cargando = false;
  noHayMas = false;

  searchControl = new FormControl('');
  terminoBusqueda = '';

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('🟦 INIT COMPONENT Productos');
    this.cargarPagina();

    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(value => {
        this.terminoBusqueda = value?.toLowerCase() || '';
        console.log('🔎 Filtro →', this.terminoBusqueda);
        this.filtrarProductos();
      });
  }

  cargarPagina(): void {
    if (this.cargando || this.noHayMas) return;

    console.log(`📌 SOLICITANDO PÁGINA: ${this.pagina}`);
    this.cargando = true;

    this.productoService.obtenerPaginado(this.pagina, this.pageSize).subscribe({
      next: (res: PagedResult<ProductoDTO>) => {
        console.log('📥 RESPUESTA BACKEND:', res);

        this.totalRegistros = res.total;
        this.productos.push(...res.items);

        console.log('📦 Total acumulado en memoria:', this.productos.length);

        this.filtrarProductos();

        this.pagina++;
        if (this.productos.length >= this.totalRegistros) {
          this.noHayMas = true;
        }

        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
      }
    });
  }

  // Scroll real dentro del div de productos
  onScrollDiv() {
    const div = this.scrollContenedor.nativeElement;

    const scrollTop = div.scrollTop;
    const scrollHeight = div.scrollHeight;
    const clientHeight = div.clientHeight;

    const distancia = scrollHeight - (scrollTop + clientHeight);

    console.log('📜 DIV SCROLL — distancia al fondo:', distancia);

    if (distancia < 150 && !this.terminoBusqueda) {
      console.log('⬇️ Cargando siguiente página...');
      this.cargarPagina();
    }
  }

  filtrarProductos(): void {
    if (!this.terminoBusqueda) {
      this.productosMostrados = [...this.productos];
      console.log('📌 Sin filtro — productos mostrados:', this.productosMostrados.length);
      return;
    }

    const term = this.terminoBusqueda;

    this.productosMostrados = this.productos.filter(p =>
      (p.nombre?.toLowerCase().includes(term)) ||
      (p.codigo?.toLowerCase().includes(term))
    );

    console.log('📌 Con filtro — productos mostrados:', this.productosMostrados.length);
    this.productoSeleccionado = null;
  }

  seleccionarProducto(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
  }

  abrirDialogo(producto?: ProductoDTO): void {
    const dialogoRef = this.dialog.open(DialogProducto, {
      width: '600px',
      data: producto
    });

    dialogoRef.afterClosed().subscribe((resultado: EdicionProductoDTO | undefined) => {
      if (resultado) {
        this.guardarCambios(resultado, producto);
      }
    });
  }

  guardarCambios(data: EdicionProductoDTO, producto?: ProductoDTO): void {
    const edita = !!producto;
    const obs = edita
      ? this.productoService.actualizar(producto!.id!, data)
      : this.productoService.crear(data as any);

    obs.subscribe({
      next: () => {
        Swal.fire(edita ? 'Actualizado' : 'Creado', 'El producto se guardó correctamente.', 'success');
        this.resetearYRecargar();
      },
      error: () => Swal.fire('Error', 'No se pudo guardar el producto.', 'error')
    });
  }

  eliminarProducto(producto: ProductoDTO): void {
    Swal.fire({
      title: `¿Eliminar ${producto.nombre}?`,
      text: "Esta acción es irreversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (r.isConfirmed) {
        this.productoService.eliminar(producto.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Producto eliminado correctamente.', 'success');
            this.resetearYRecargar();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el producto.', 'error')
        });
      }
    });
  }

  private resetearYRecargar(): void {
    this.productos = [];
    this.productosMostrados = [];
    this.pagina = 1;
    this.noHayMas = false;
    this.productoSeleccionado = null;
    this.cargarPagina();
  }
}
