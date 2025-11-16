import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { ProductoService } from '../../Service/producto-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stock',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.scss'
})
export class Stock implements AfterViewInit {
  @Output() productoSeleccionadoParaCarrito = new EventEmitter<ProductoDTO>();
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');
  productos: ProductoDTO[] = [];
  productosMostrados: ProductoDTO[] = [];
  productoSeleccionado: ProductoDTO | null = null;

  bloque = 50;
  indice = 0;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    // Cargar todos los productos
    this.productoService.obtenerTodos().subscribe(result => {
      this.productos = result;
      this.cargarMas();
    });

    // Filtrado local
    this.searchControl.valueChanges.subscribe(term => {
      const valor = term?.toLowerCase() || '';
      this.productosMostrados = this.productos.filter(
        p => p.nombre.toLowerCase().includes(valor) || p.codigo.toLowerCase().includes(valor)
      );
      this.indice = this.productosMostrados.length;
    });
  }

  ngAfterViewInit() {
    // Pone foco en el input oculto para el escáner
    setTimeout(() => this.barcodeInput.nativeElement.focus(), 500);
  }

  // 🔹 Escaneo de producto con lector
  onBarcodeScanned(code: string) {
    const trimmed = code.trim();
    const producto = this.productos.find(p => p.codigo === trimmed);

    if (producto) {
      // 🔹 Clonamos para forzar nueva referencia
      const productoClonado = { ...producto };
      this.productoSeleccionadoParaCarrito.emit(productoClonado);
      this.productoSeleccionado = producto;

      Swal.fire({
        icon: 'success',
        title: producto.nombre,
        text: 'Agregado al carrito',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1200
      });

      console.log('✅ Producto agregado desde escáner:', producto.nombre);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No encontrado',
        text: `No se encontró un producto con código ${trimmed}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
      console.warn('❌ Producto no encontrado:', trimmed);
    }

    // 🔹 Limpieza y reenfoque
    this.barcodeInput.nativeElement.value = '';
    this.barcodeInput.nativeElement.focus();
  }

  // 🔹 Scroll infinito
  cargarMas() {
    const siguienteBloque = this.productos.slice(this.indice, this.indice + this.bloque);
    this.productosMostrados = [...this.productosMostrados, ...siguienteBloque];
    this.indice += this.bloque;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      if (this.indice < this.productos.length) {
        this.cargarMas();
      }
    }
  }

  // 🔹 Selección manual con click
  seleccionarProducto(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
    this.productoSeleccionadoParaCarrito.emit({ ...producto }); // también clonado
  }
}