import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Faena, FaenaService } from '../services/faena'; // 1. Importar
import { VolverAtras } from '../volver-atras/volver-atras';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../services/auth'; // 2. Importar el servicio de autenticación

@Component({
  selector: 'app-select-faena',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, VolverAtras],
  templateUrl: './select-faena.html'
})
export class SelectFaena implements OnInit {
  // 2. La propiedad ahora será un Observable
  faenas$!: Observable<Faena[]>;
  backLink: string[] | null = null;

  // 3. Inyectar el servicio
  constructor(private faenaService: FaenaService, private authService: AuthService) {}

  ngOnInit(): void {
    this.faenas$ = this.faenaService.getFaenas();

    // 4. Determinar el enlace de "volver" basado en el rol del usuario
    const userRole = this.authService.getUserRole();
    if (userRole === 'admin') {
      this.backLink = ['/admin'];
    } else {
      // Para 'empresa', el comportamiento por defecto es volver al login
      this.backLink = ['/login'];
    }
  }
}
