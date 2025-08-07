import { Component, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // 1. Importar Location
import { RouterModule } from '@angular/router'; // 2. Importar RouterModule
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-volver-atras',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule], // 3. Añadir RouterModule
  template: `
    <a
      *ngIf="customBackLink; else defaultBack"
      [routerLink]="customBackLink"
      class="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
    >
      <lucide-icon [img]="ArrowLeft" class="h-5 w-5"></lucide-icon>
      <span class="font-medium">Volver</span>
    </a>

    <ng-template #defaultBack>
      <button
        (click)="goBack()"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <lucide-icon [img]="ArrowLeft" class="h-5 w-5"></lucide-icon>
        <span class="font-medium">Volver</span>
      </button>
    </ng-template>
  `
})
export class VolverAtras {
  ArrowLeft = ArrowLeft;

  // 4. Añadir un Input para la ruta personalizada
  @Input() customBackLink: string | any[] | null | undefined;

  constructor(private location: Location) {}

  // 5. El método goBack ahora usa el servicio Location
  goBack(): void {
    this.location.back();
  }
}
