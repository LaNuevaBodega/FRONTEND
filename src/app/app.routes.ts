import { Routes } from '@angular/router';

import { Dashboard } from './dashboard/dashboard';
import { Proveedores } from './proveedores/proveedores';
import { Ventas } from './ventas/ventas';
import { Rubros } from './rubros/rubros';
import { Layout } from './layout/layout';
import { Facturas } from './facturas/facturas';
import { Productos } from './productos/productos';
import { AuthGuard } from '../Service/auth.guard';
import { ProductosPage } from './productos-page/productos-page';
import { Login } from './login/login';
import { HistorialVentas } from './ventas/historial/historial-ventas/historial-ventas';
import { CajaHistorial } from './caja-historial/caja-historial';
import { Clientes } from './clientes/clientes';
import { Condicioniva } from './condicioniva/condicioniva';
import { Reportes } from './reportes/reportes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: 'app',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'ventas',
        children: [
          { path: '', component: Ventas },
          { path: 'historial', component: HistorialVentas }
        ]
      },
      { path: 'dashboard', component: Dashboard },
      { path: 'reportes', component: Reportes },
      { path: 'historialcaja', component: CajaHistorial },
      { path: 'proveedores', component: Proveedores },
      { path: 'rubros', component: Rubros },
      { path: 'facturas', component: Facturas },
      { path: 'productos', component: ProductosPage },
      { path: 'clientes', component: Clientes },
      { path: 'condicioniva', component: Condicioniva }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
