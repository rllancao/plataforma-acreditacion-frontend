// src/app/select-faena/select-faena.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrowLeft } from 'lucide-angular'
import { LucideAngularModule } from 'lucide-angular';
import {VolverAtras} from '../volver-atras/volver-atras';


@Component({
  selector: 'app-select-faena',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, VolverAtras],
  templateUrl: './select-faena.html'
})
export class SelectFaena {

  goBack = () => history.back();
  faenas = [
    { id: 'f1', name: 'Faena Salar La Isla' },
    { id: 'f2', name: 'Blanco Litio Norte' },
    { id: 'f3', name: 'Faena Planta Química Río Seco' },
    { id: 'f4', name: 'Explotación Salar El Milagro' },
    { id: 'f5', name: 'Campamento Minero Laguna Verde'},
  ];
}
