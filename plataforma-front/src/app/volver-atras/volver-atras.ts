import { Component } from '@angular/core';
import {ArrowLeft, LucideAngularModule} from "lucide-angular";

@Component({
  selector: 'app-volver-atras',
    imports: [
        LucideAngularModule
    ],
  templateUrl: './volver-atras.html',
  styleUrl: './volver-atras.scss'
})
export class VolverAtras {
  goBack = () => history.back();
  readonly ArrowLeft = ArrowLeft;
}
