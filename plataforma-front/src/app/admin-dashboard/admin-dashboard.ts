import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Briefcase, PlusCircle, Building2, UserPlus } from 'lucide-angular'; // Importar UserPlus

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <header class="mb-8 flex items-center">
        <h1 class="text-3xl font-bold text-gray-800">Panel de Administración</h1>
      </header>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <a routerLink="/select-faena" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="Building2" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Seleccionar Faena</h2>
          <p class="mt-1 text-sm text-gray-500">Ver y gestionar faenas.</p>
        </a>
        <a routerLink="/admin/ingresar-faena" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="PlusCircle" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Ingresar Faena</h2>
          <p class="mt-1 text-sm text-gray-500">Crear una nueva faena.</p>
        </a>
        <!-- ✅ NUEVA OPCIÓN DE MENÚ -->
        <a routerLink="/admin/ingresar-empresa" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="UserPlus" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Ingresar Empresa</h2>
          <p class="mt-1 text-sm text-gray-500">Registrar una nueva empresa.</p>
        </a>
        <a routerLink="/admin/ingresar-trabajador" class="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg transition hover:bg-indigo-50">
          <lucide-icon [img]="Briefcase" class="h-12 w-12 text-indigo-600"></lucide-icon>
          <h2 class="mt-4 text-xl font-semibold">Ingresar Trabajadores</h2>
          <p class="mt-1 text-sm text-gray-500">Añadir nuevos trabajadores.</p>
        </a>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  Briefcase = Briefcase;
  PlusCircle = PlusCircle;
  Building2 = Building2;
  UserPlus = UserPlus; // Exponer el nuevo icono
}
