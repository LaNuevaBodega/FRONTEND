import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { ProductoService } from '../../Service/producto-service';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatAnchor, MatButtonModule } from "@angular/material/button";


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatAnchor,
    MatButtonModule
],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit, OnDestroy {

  @Input() triggerRefrescar: number = 0;
  @Output() productoSeleccionado = new EventEmitter<ProductoDTO | null>();
  @Output() agregar = new EventEmitter<void>();
  @Output() exportarBalanza = new EventEmitter<void>();


  productos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];

  pagina = 1;
  pageSize = 200;
  cargando = false;
  noHayMas = false;
  termino = '';

  private iniciado = false;

  searchControl = new FormControl('');

  private subs: Subscription[] = [];

  constructor(
    private service: ProductoService,

  ) { }

  ngOnInit(): void {

    this.iniciado = true;
    this.cargarPagina();

    const subFiltro = this.searchControl.valueChanges
      .pipe(debounceTime(400))
      .subscribe(valor => {
        this.termino = valor ?? '';
        this.refrescarBusqueda();
      });

    this.subs.push(subFiltro);

  }

  ngOnChanges() {
    if (!this.iniciado) 
      return;
    this.pagina = 1;
    this.noHayMas = false;
    this.productos = [];
    this.cargarPagina();
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

  private refrescarBusqueda(): void {
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

  refrescarDesdePadre(): void {
    this.pagina = 1;
    this.noHayMas = false;
    this.productos = [];
    this.cargarPagina();
  }

  get productosElaborados(): ProductoDTO[] {
    return this.productos.filter(p => p.esElaborado);
  }

  get productosStock(): ProductoDTO[] {
    return this.productos.filter(p => !p.esElaborado);
  }

}


