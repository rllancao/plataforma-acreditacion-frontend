import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Trabajador, TrabajadorService } from '../services/trabajador';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-detalle-trabajador',
  standalone: true,
  imports: [CommonModule, VolverAtras],
  templateUrl: './detalle-trabajador.html',
})
export class DetalleTrabajadorComponent implements OnInit {
  trabajador$!: Observable<Trabajador>;

  constructor(
    private route: ActivatedRoute,
    private trabajadorService: TrabajadorService
  ) {}

  ngOnInit(): void {
    // Usamos switchMap para tomar el 'id' del paramMap y llamar al servicio
    this.trabajador$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.trabajadorService.getTrabajadorById(id);
      })
    );
  }
}
