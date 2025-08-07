import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Linkedin, Facebook, Instagram } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './footer.html',
})
export class FooterComponent {
  // Exponer iconos para la plantilla
  Linkedin = Linkedin;
  Facebook = Facebook;
  Instagram = Instagram;

  // Propiedad para mostrar el año actual dinámicamente
  currentYear = new Date().getFullYear();
}
