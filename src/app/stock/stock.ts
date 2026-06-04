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
import { NotificationService } from '../../Service/notification-service';

@Component({
  selector: 'app-stock',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.scss'
})
export class Stock implements AfterViewInit {

  @Output() productoSeleccionadoParaCarrito = new EventEmitter<ProductoDTO>();
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  @ViewChild('tablaProductos') tablaProductosRef!: ElementRef<HTMLDivElement>;


  searchControl = new FormControl('');
  productos: ProductoDTO[] = [];
  productosMostrados: ProductoDTO[] = [];
  productoSeleccionado: ProductoDTO | null = null;

  private bloque = 50;
  private indice = 0;

  private focusTimeout: any = null;

  constructor(private productoService: ProductoService, private notif: NotificationService) { }

  ngOnInit() {
    this.productoService.obtenerTodos().subscribe(result => {
      this.productos = result;
      this.cargarMas();
    });

    this.searchControl.valueChanges.subscribe(term => {
      const value = term?.toLowerCase() || '';
      this.productosMostrados = this.productos.filter(
        p => p.nombre.toLowerCase().includes(value) || p.codigo.toLowerCase().includes(value)
      );
      this.indice = this.productosMostrados.length;
    });
  }

  ngAfterViewInit() {

    setTimeout(() => this.forceFocus("afterViewInit-first"), 30);

    setTimeout(() => this.solicitarFocus("afterViewInit-pro"), 300);

    this.tablaProductosRef.nativeElement.addEventListener('scroll', () => {
      this.onTablaScroll();
    });
  }

  onTablaScroll() {
    const el = this.tablaProductosRef.nativeElement;
    const distanciaAlFondo = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanciaAlFondo < 200 && this.indice < this.productos.length) {
      this.cargarMas();
    }

    this.solicitarFocus("scroll");
  }

  private toastOk(producto: ProductoDTO) {
    this.notif.success(`${producto.nombre} — Agregado al carrito`, 1500);
  }

  private toastError(code: string) {
    this.notif.error(`No encontrado — Código ${code}`, 2000);
  }

  onBarcodeScanned(code: string) {
    console.log(`%c📦 CÓDIGO RECIBIDO: "${code}"`, 'background: #222; color: #bada55; font-size: 1.2rem');

    const trimmed = code.trim();
    const producto = this.productos.find(p => p.codigo === trimmed);

    if (producto) {

      console.error(`❌ El código "${trimmed}" no existe en la base de datos.`);
      this.productoSeleccionadoParaCarrito.emit({ ...producto });
      this.productoSeleccionado = producto;
      this.toastOk(producto);
    } else {
      this.toastError(trimmed);
    }

    this.barcodeInput.nativeElement.value = '';
    this.solicitarFocus("afterScan");
  }

  cargarMas() {
    const lote = this.productos.slice(this.indice, this.indice + this.bloque);
    this.productosMostrados = [...this.productosMostrados, ...lote];
    this.indice += this.bloque;
  }

  // @HostListener('window:scroll')
  // onScroll() {
  //   if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
  //     if (this.indice < this.productos.length) {
  //       this.cargarMas();
  //     }
  //   }
  //   this.solicitarFocus("scroll");
  // }



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
    console.log(`%c🎯 Foco solicitado por: ${origen}`, 'color: #00ff00; font-weight: bold');
    el.focus();
  }

  // @HostListener('document:keydown', ['$event'])
  // onKey(e: KeyboardEvent) {
  //   if (!this.barcodeInput) return;

  //   const active = document.activeElement;
  //   const scannerInput = this.barcodeInput.nativeElement;


  //   console.log(`⌨️ Tecla: ${e.key} | Foco en: ${active?.tagName}#${active?.id || 'sin-id'}`);


  //   const isTypingInSearch = active instanceof HTMLInputElement && active.type === 'text' && active !== scannerInput;

  //   if (isTypingInSearch) {
  //     console.warn('⚠️ Escribiendo en buscador: Scanner pausado');
  //     return;
  //   }


  //   if (active !== scannerInput) {

  //     if (e.key.length === 1) {
  //       console.log('🚀 Redirigiendo tecla al scanner...');
  //       e.preventDefault();
  //       this.solicitarFocus("global-keydown");


  //       scannerInput.value += e.key;
  //     }
  //   }
  // }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {

    if (!this.barcodeInput) return;

    const scannerInput = this.barcodeInput.nativeElement;
    const active = document.activeElement;

    // 🚫 Si hay un dialog abierto, no usar scanner
    if (document.querySelector('.cdk-overlay-pane')) {
      return;
    }

    const isTypingInSearch =
      active instanceof HTMLInputElement &&
      active.type === 'text' &&
      active !== scannerInput;

    if (isTypingInSearch) {
      return;
    }

    if (active !== scannerInput) {

      if (e.key.length === 1) {
        e.preventDefault();
        this.solicitarFocus("global-keydown");
        scannerInput.value += e.key;
      }
    }
  }

  // @HostListener('document:click', ['$event'])
  // onClick(e: MouseEvent) {
  //   const target = e.target as HTMLElement;
  //   const scannerInput = this.barcodeInput.nativeElement;


  //   const isSearchInput = target instanceof HTMLInputElement && target !== scannerInput;

  //   if (isSearchInput) {
  //     return; 
  //   }

  //   this.solicitarFocus("click");
  // }


  @HostListener('document:click', ['$event'])
  onClick(e: MouseEvent) {

    if (document.querySelector('.cdk-overlay-pane')) {
      return;
    }

    const target = e.target as HTMLElement;
    const scannerInput = this.barcodeInput.nativeElement;

    const isSearchInput =
      target instanceof HTMLInputElement &&
      target !== scannerInput;

    if (isSearchInput) return;

    this.solicitarFocus("click");
  }

  seleccionarProducto(producto: ProductoDTO) {
    this.productoSeleccionado = producto;
    this.productoSeleccionadoParaCarrito.emit({ ...producto });
  }
}
