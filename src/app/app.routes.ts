import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Proveedores } from './proveedores/proveedores';
import { Ventas } from './ventas/ventas';
import { Rubros } from './rubros/rubros';
import { Layout } from './layout/layout';
import { Facturas } from './facturas/facturas';
import { Productos } from './productos/productos';
import { AuthGuard } from '../Service/auth.guard';
import { ProductosPage } from './productos-page/productos-page';

export const routes: Routes = [
        
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    
    {
        path: 'app', 
        component: Layout, 
        canActivate: [AuthGuard],
        children: [
            { path: 'ventas', component: Ventas },
            { path: 'dashboard', component: Dashboard },            
            { path: 'proveedores', component: Proveedores },
            { path: 'rubros', component: Rubros },
            { path: 'facturas', component: Facturas },
            { path: 'productos', component: ProductosPage },
            
        ]
    },
    
    { path: '**', redirectTo: 'login' }
];
