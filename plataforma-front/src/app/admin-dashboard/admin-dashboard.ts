import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VolverAtras } from '../volver-atras/volver-atras';
import { LucideAngularModule, Briefcase, PlusCircle, Building2 } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, VolverAtras, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <header class="mb-8 flex items-center">
        <h1 class="text-3xl font-bold text-gray-800">Panel de Administración</h1>
      </header>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <a routerLink="/select-faena" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="Building2" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Seleccionar Faena</h2>
          <p class="mt-1 text-sm text-gray-500">Ver y gestionar faenas existentes.</p>
        </a>
        <a routerLink="/admin/ingresar-faena" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="PlusCircle" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Ingresar Faena</h2>
          <p class="mt-1 text-sm text-gray-500">Crear una nueva faena y definir sus requisitos.</p>
        </a>
        <a routerLink="/admin/ingresar-trabajador" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="Briefcase" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Ingresar Trabajadores</h2>
          <p class="mt-1 text-sm text-gray-500">Añadir nuevos trabajadores al sistema.</p>
        </a>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  Briefcase = Briefcase;
  PlusCircle = PlusCircle;
  Building2 = Building2;
}
