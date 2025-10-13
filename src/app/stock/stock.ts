import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { ProductoService } from '../../Service/producto-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock',
  imports: [CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss'
})
export class Stock {
  @Output() productoSeleccionadoParaCarrito = new EventEmitter<ProductoDTO>();

  searchControl = new FormControl('');
  productos: ProductoDTO[] = []; // todos los productos cargados
  productosMostrados: ProductoDTO[] = []; // productos visibles
  productoSeleccionado: ProductoDTO | null = null;

  bloque = 50; // cantidad a cargar por vez
  indice = 0; // índice del siguiente bloque

  constructor(private productoService: ProductoService) { }

  ngOnInit() {
    // Traer todos los productos del backend
    this.productoService.obtenerTodos().subscribe(result => {
      this.productos = result;
      this.cargarMas(); // cargar primer bloque
    });

    // Filtrado local
    this.searchControl.valueChanges.subscribe(term => {
      const valor = term?.toLowerCase() || '';
      this.productosMostrados = this.productos
        .filter(p => p.nombre.toLowerCase().includes(valor) || p.codigo.toLowerCase().includes(valor));
      this.indice = this.productosMostrados.length; // para scroll infinito
    });
  }

  // Cargar siguiente bloque
  cargarMas() {
    const siguienteBloque = this.productos.slice(this.indice, this.indice + this.bloque);
    this.productosMostrados = [...this.productosMostrados, ...siguienteBloque];
    this.indice += this.bloque;
  }

  // Detectar scroll
  @HostListener('window:scroll', [])
  onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      // si queda más para llegar al final, cargamos siguiente bloque
      if (this.indice < this.productos.length) {
        this.cargarMas();
      }
    }
  }

  seleccionarProducto(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
    this.productoSeleccionadoParaCarrito.emit(producto); // envía al carrito
  }

}
