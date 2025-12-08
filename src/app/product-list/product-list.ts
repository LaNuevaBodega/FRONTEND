import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';

import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { PagedResult } from '../../interfaces/PagedResult';
import { ProductoService } from '../../Service/producto-service';

import { RealtimeChange, SignalRService } from '../../Service/SignalRService';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit, OnDestroy {


  @Output() productoSeleccionado = new EventEmitter<ProductoDTO | null>();
  @Output() agregar = new EventEmitter<void>();


  productos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];

  pagina = 1;
  pageSize = 200;
  cargando = false;
  noHayMas = false;
  termino = '';

  searchControl = new FormControl('');

  private subs: Subscription[] = [];

  constructor(
    private service: ProductoService,
    private signalR: SignalRService,
    
  ) {}

  ngOnInit(): void {
    this.cargarPagina();

    const subFiltro = this.searchControl.valueChanges
      .pipe(debounceTime(400))
      .subscribe(valor => {
        this.termino = valor ?? '';
        this.buscarEnBackend();
      });

    this.subs.push(subFiltro);

    const subSignalR = this.signalR
      .cambiosDeEntidad('producto')
      .subscribe((cambio: RealtimeChange<any>) => {

        if (cambio.accion === 'creado') {
          this.onProductoCreado(cambio.payload);
        } else if (cambio.accion === 'actualizado') {
          this.onProductoActualizado(cambio.payload);
        } else if (cambio.accion === 'eliminado') {
          this.onProductoEliminado(cambio.payload.id);
        }
      });

    this.subs.push(subSignalR);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  cargarPagina(): void {
    if (this.cargando || this.noHayMas) return;

    this.cargando = true;

    this.service.obtenerPaginado(this.pagina, this.pageSize, this.termino)
      .subscribe({
        next: (res) => {

          if (this.pagina === 1) {
            this.productos = res.items;
          } else {
            this.productos.push(...res.items);
          }

          this.productosFiltrados = [...this.productos];

          if (this.productos.length >= res.total) {
            this.noHayMas = true;
          }

          this.pagina++;
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
  }

  buscarEnBackend(): void {
    this.pagina = 1;
    this.noHayMas = false;
    this.productos = [];
    this.cargarPagina();
  }

  onScroll(e: any): void {
    if (this.termino) return;

    const div = e.target;
    const distancia = div.scrollHeight - div.scrollTop - div.clientHeight;

    if (distancia < 250) {
      this.cargarPagina();
    }
  }




  seleccionar(p: ProductoDTO): void {
    this.productoSeleccionado.emit(p);
  }

  private onProductoCreado(prod: ProductoDTO): void {
    this.productos.unshift(prod);
    this.productosFiltrados = [...this.productos];
  }

  private onProductoActualizado(prod: ProductoDTO): void {
    const index = this.productos.findIndex(p => p.id === prod.id);
    if (index !== -1) {
      this.productos[index] = { ...this.productos[index], ...prod };
    }
    this.productosFiltrados = [...this.productos];
  }

  private onProductoEliminado(id: number): void {
    this.productos = this.productos.filter(p => p.id !== id);
    this.productosFiltrados = [...this.productos];
    this.productoSeleccionado.emit(null);
  }
}


