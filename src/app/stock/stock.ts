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

  private bloque = 50;
  private indice = 0;

  // Debounce del focus
  private focusTimeout: any = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.productoService.obtenerTodos().subscribe(result => {
      this.productos = result;
      this.cargarMas();
    });

    // Filtro del buscador
    this.searchControl.valueChanges.subscribe(term => {
      const value = term?.toLowerCase() || '';
      this.productosMostrados = this.productos.filter(
        p => p.nombre.toLowerCase().includes(value) || p.codigo.toLowerCase().includes(value)
      );
      this.indice = this.productosMostrados.length;
    });
  }

  ngAfterViewInit() {
    // Primer enfoque inmediato
    setTimeout(() => this.forceFocus("afterViewInit-first"), 30);

    // Reenfoque PRO estabilizado
    setTimeout(() => this.solicitarFocus("afterViewInit-pro"), 300);
  }

  // --------------------------------------------------------------------
  // 🔥 TOASTS SIN ROBO DE FOCO
  // --------------------------------------------------------------------
  private toastBase(config: any) {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      backdrop: false,
      ...config,
      didOpen: toast => {
        toast.setAttribute('tabindex', '-1'); // EVITA tomar foco
      }
    });
  }

  private toastOk(producto: ProductoDTO) {
    this.toastBase({
      icon: 'success',
      title: producto.nombre,
      text: 'Agregado al carrito',
      timer: 1200
    });
  }

  private toastError(code: string) {
    this.toastBase({
      icon: 'error',
      title: 'No encontrado',
      text: `Código ${code}`,
      timer: 1500
    });
  }

  // --------------------------------------------------------------------
  // 🎯 ESCANEO
  // --------------------------------------------------------------------
  onBarcodeScanned(code: string) {
    const trimmed = code.trim();
    const producto = this.productos.find(p => p.codigo === trimmed);

    if (producto) {
      this.productoSeleccionadoParaCarrito.emit({ ...producto });
      this.productoSeleccionado = producto;
      this.toastOk(producto);
    } else {
      this.toastError(trimmed);
    }

    // limpiar + reenfocar
    this.barcodeInput.nativeElement.value = '';
    this.solicitarFocus("afterScan");
  }

  // --------------------------------------------------------------------
  // 📜 SCROLL INFINITO
  // --------------------------------------------------------------------
  cargarMas() {
    const lote = this.productos.slice(this.indice, this.indice + this.bloque);
    this.productosMostrados = [...this.productosMostrados, ...lote];
    this.indice += this.bloque;
  }

  @HostListener('window:scroll')
  onScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      if (this.indice < this.productos.length) {
        this.cargarMas();
      }
    }
    this.solicitarFocus("scroll");
  }

  // --------------------------------------------------------------------
  // 🎯 SISTEMA DE FOCO PRO
  // --------------------------------------------------------------------
  private solicitarFocus(origen: string) {
    if (!this.barcodeInput) return;

    if (this.focusTimeout) clearTimeout(this.focusTimeout);

    this.focusTimeout = setTimeout(() => {
      this.forceFocus(origen);
      this.focusTimeout = null;
    }, 120);
  }

  private forceFocus(origen: string) {
    const el = this.barcodeInput.nativeElement;
    el.focus();
  }

  // --------------------------------------------------------------------
  // ⌨️ MANEJO GLOBAL DEL TECLADO
  // --------------------------------------------------------------------
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.barcodeInput) return;

    const active = document.activeElement;
    const target = this.barcodeInput.nativeElement;

    // Si NO estoy en el input → evitar que escriba en otro lado
    if (active !== target) {
      e.preventDefault();
      this.solicitarFocus("global-keydown");
      return;
    }

    // Si sí estoy enfocado → todo normal
  }

  @HostListener('document:click')
  onClick() {
    this.solicitarFocus("click");
  }

  // --------------------------------------------------------------------
  // 🖱 Selección manual desde la lista
  // --------------------------------------------------------------------
  seleccionarProducto(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
    this.productoSeleccionadoParaCarrito.emit({ ...producto });
  }
}
