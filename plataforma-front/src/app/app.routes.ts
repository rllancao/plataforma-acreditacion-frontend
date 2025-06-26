// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SelectFaena } from './select-faena/select-faena';
import {OlvidastePass} from "./olvidaste-pass/olvidaste-pass";

export const routes: Routes = [
  { path: '',           redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',      component: Login },
  { path: 'select-faena', component: SelectFaena },
  {path: 'olvidaste-pass', component: OlvidastePass},
  { path: '**',         redirectTo: 'login' },
];
