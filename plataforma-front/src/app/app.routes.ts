import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SelectFaena } from './select-faena/select-faena';
import { OlvidastePass } from "./olvidaste-pass/olvidaste-pass";
import { DashboardComponent } from './dashboard/dashboard';
import { DetalleTrabajadorComponent } from './detalle-trabajador/detalle-trabajador';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { IngresarFaenaComponent } from './ingresar-faena/ingresar-faena';
import { IngresarEmpresaComponent } from './ingresar-empresa/ingresar-empresa';
import { IngresarTrabajadorComponent } from './ingresar-trabajador/ingresar-trabajador';

// Importar los guards
import { authGuard } from './auth-guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  // Rutas públicas (sin guards)
  { path: 'login', component: Login },
  { path: 'olvidaste-pass', component: OlvidastePass },

  // Rutas protegidas para cualquier usuario logueado
  { path: 'select-faena', component: SelectFaena, canActivate: [authGuard] },
  { path: 'dashboard/:id', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'trabajador/:id', component: DetalleTrabajadorComponent, canActivate: [authGuard] },

  // Rutas protegidas EXCLUSIVAMENTE para administradores
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/ingresar-faena', component: IngresarFaenaComponent, canActivate: [adminGuard] },
  { path: 'admin/ingresar-empresa', component: IngresarEmpresaComponent, canActivate: [adminGuard] },
  { path: 'admin/ingresar-trabajador', component: IngresarTrabajadorComponent, canActivate: [adminGuard] },

  // Rutas por defecto y de fallback
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
