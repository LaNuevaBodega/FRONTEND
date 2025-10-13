import { Component } from '@angular/core';
import { Productos } from '../productos/productos';
import { Carrito } from '../carrito/carrito';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Productos,
    Carrito,   
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {

}
