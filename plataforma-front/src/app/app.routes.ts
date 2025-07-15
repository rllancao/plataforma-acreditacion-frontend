import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SelectFaena } from './select-faena/select-faena';
import { OlvidastePass } from "./olvidaste-pass/olvidaste-pass";
import { DashboardComponent } from './dashboard/dashboard';
import { DetalleTrabajadorComponent } from './detalle-trabajador/detalle-trabajador'; // 1. Importar
import { IngresarFaenaComponent } from './ingresar-faena/ingresar-faena';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'select-faena', component: SelectFaena },
  { path: 'olvidaste-pass', component: OlvidastePass },
  { path: 'dashboard/:id', component: DashboardComponent },
  // 2. Nueva ruta para el detalle del trabajador
  { path: 'trabajador/:id', component: DetalleTrabajadorComponent },
  { path: 'admin/ingresar-faena', component: IngresarFaenaComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: 'login' },
];
