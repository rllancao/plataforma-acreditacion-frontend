import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Login} from './login/login';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';
import {LucideAngularModule, LogOut} from 'lucide-angular';
import { HeaderComponent} from './header/header';
import { FooterComponent } from './footer/footer';
import { NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,FormsModule, LucideAngularModule, HeaderComponent, FooterComponent ],
  templateUrl: './app.html',
})
export class App {
  protected title = 'plataforma-front';
  LogOut = LogOut;



  constructor(
    public authService: AuthService, // Se hace público para usarlo en la plantilla
    private router: Router
  ) {}
/*
  ngOnInit(): void {
    // Escucha los eventos de navegación para detectar cambios manuales en la URL.
    this.router.events.pipe(
      filter((event): event is NavigationStart => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      // El trigger 'popstate' se activa al usar los botones de historial del navegador
      // o al escribir una nueva URL directamente en la barra de direcciones.
      if (event.navigationTrigger === 'popstate' && this.authService.isAuthenticated()) {
        console.log('Navegación manual o por historial detectada, cerrando sesión.');
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

 */

  get showHeaderAndFooter(): boolean {
    const publicRoutes = ['/login', '/olvidaste-pass'];
    return this.authService.isAuthenticated() && !publicRoutes.includes(this.router.url);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
