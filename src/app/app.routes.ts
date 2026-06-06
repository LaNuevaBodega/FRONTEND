import { Routes } from '@angular/router';

import { Dashboard } from './dashboard/dashboard';
import { Proveedores } from './proveedores/proveedores';
import { Ventas } from './ventas/ventas';
import { Rubros } from './rubros/rubros';
import { Layout } from './layout/layout';
import { Facturas } from './facturas/facturas';
import { Productos } from './productos/productos';
import { AuthGuard } from '../Service/auth.guard';
import { RoleGuard } from '../Service/role.guard';
import { PermisoGuard } from '../Service/permiso.guard';
import { ProductosPage } from './productos-page/productos-page';
import { Login } from './login/login';
import { HistorialVentas } from './ventas/historial/historial-ventas/historial-ventas';
import { CajaHistorial } from './caja-historial/caja-historial';
import { Clientes } from './clientes/clientes';
import { Condicioniva } from './condicioniva/condicioniva';
import { Reportes } from './reportes/reportes';
import { Configuracion } from './configuracion/configuracion';
import { Auditoria } from './auditoria/auditoria';

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
          { path: '', component: Ventas, canActivate: [PermisoGuard], data: { permiso: 'ventas' } },
          { path: 'historial', component: HistorialVentas, canActivate: [PermisoGuard], data: { permiso: 'historial' } }
        ]
      },
      { path: 'dashboard', component: Dashboard, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'reportes', component: Reportes, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'historialcaja', component: CajaHistorial, canActivate: [PermisoGuard], data: { permiso: 'caja' } },
      { path: 'proveedores', component: Proveedores, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'rubros', component: Rubros, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'facturas', component: Facturas, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'productos', component: ProductosPage, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'clientes', component: Clientes, canActivate: [PermisoGuard], data: { permiso: 'clientes' } },
      { path: 'condicioniva', component: Condicioniva, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'configuracion', component: Configuracion, canActivate: [RoleGuard], data: { roles: ['Administrador'] } },
      { path: 'auditoria', component: Auditoria, canActivate: [RoleGuard], data: { roles: ['Administrador'] } }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
