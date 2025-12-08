import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {

  @Input() producto: ProductoDTO | null = null;

  @Output() editar = new EventEmitter<ProductoDTO>();
  @Output() eliminar = new EventEmitter<ProductoDTO>();

  onEditar() {
    if (this.producto) {
      this.editar.emit(this.producto);
    }
  }

  onEliminar() {
    if (this.producto) {
      this.eliminar.emit(this.producto);
    }
  }

}
