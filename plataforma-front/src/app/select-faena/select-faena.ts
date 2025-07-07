import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Faena, FaenaService } from '../services/faena'; // 1. Importar
import { VolverAtras } from '../volver-atras/volver-atras';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-select-faena',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, VolverAtras],
  templateUrl: './select-faena.html'
})
export class SelectFaena implements OnInit {
  // 2. La propiedad ahora será un Observable
  faenas$!: Observable<Faena[]>;

  // 3. Inyectar el servicio
  constructor(private faenaService: FaenaService) {}

  ngOnInit(): void {
    // 4. Llamar al servicio para obtener los datos
    this.faenas$ = this.faenaService.getFaenas();
  }
}
