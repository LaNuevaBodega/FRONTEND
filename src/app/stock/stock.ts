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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  productosMostrados: ProductoDTO[] = [];
  productoSeleccionado: ProductoDTO | null = null;

  // Paginación server-side: el catálogo (8000+) ya no se descarga entero.
  private pageSize = 50;
  private pagina = 1;
  private total = 0;
  private termino = '';
  cargando = false;
  private reqId = 0;

  private focusTimeout: any = null;

  constructor(private productoService: ProductoService, private notif: NotificationService) { }

  ngOnInit() {
    this.resetYcargar('');

    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(term => this.resetYcargar((term || '').trim()));
  }

  private resetYcargar(termino: string) {
    this.termino = termino;
    this.pagina = 1;
    this.cargarPagina();
  }

  // Trae una página del backend. Un reqId descarta respuestas obsoletas
  // (p.ej. si el usuario sigue tipeando mientras llega una respuesta vieja).
  private cargarPagina() {
    const id = ++this.reqId;
    this.cargando = true;
    const paginaActual = this.pagina;

    this.productoService.obtenerPaginado(paginaActual, this.pageSize, this.termino).subscribe({
      next: (res) => {
        if (id !== this.reqId) return;
        this.productosMostrados = paginaActual === 1
          ? res.items
          : [...this.productosMostrados, ...res.items];
        this.total = res.total;
        this.cargando = false;
      },
      error: () => { if (id === this.reqId) this.cargando = false; }
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

    if (distanciaAlFondo < 200) {
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
    const trimmed = code.trim();
    this.barcodeInput.nativeElement.value = '';

    if (!trimmed) {
      this.solicitarFocus("afterScan");
      return;
    }

    // Lookup exacto contra la vista en el backend (precio/stock reales de MoviSQL).
    this.productoService.buscarEnVistaPorCodigo(trimmed).subscribe({
      next: (producto) => {
        this.productoSeleccionadoParaCarrito.emit({ ...producto });
        this.productoSeleccionado = producto;
        this.toastOk(producto);
        this.solicitarFocus("afterScan");
      },
      error: () => {
        this.toastError(trimmed);
        this.solicitarFocus("afterScan");
      }
    });
  }

  cargarMas() {
    if (this.cargando || this.productosMostrados.length >= this.total) return;
    this.pagina++;
    this.cargarPagina();
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
