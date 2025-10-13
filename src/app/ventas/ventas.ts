import { Component } from "@angular/core";
import { Productos } from "../productos/productos";
import { Carrito } from "../carrito/carrito";
import { Stock } from "../stock/stock";


@Component({
  selector: 'app-ventas',
  standalone:true,
  imports: [
    Carrito, 
    Stock],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss'
})
export class Ventas {
  

}
