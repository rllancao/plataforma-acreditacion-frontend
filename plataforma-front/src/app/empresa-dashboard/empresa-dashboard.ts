import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Building2, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <header class="mb-8 flex items-center">
        <h1 class="text-3xl font-bold text-gray-800">Panel de Empresa</h1>
      </header>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <a routerLink="/select-faena" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="Building2" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Seleccionar Faena</h2>
          <p class="mt-1 text-sm text-gray-500">Ver y gestionar trabajadores por faena.</p>
        </a>
        <a routerLink="/empresa/ingresar-empleado" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="UserPlus" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Ingresar Empleado</h2>
          <p class="mt-1 text-sm text-gray-500">Crear y asignar faenas a un nuevo empleado.</p>
        </a>
      </div>
    </div>
  `
})
export class EmpresaDashboardComponent {
  Building2 = Building2;
  UserPlus = UserPlus;
}
