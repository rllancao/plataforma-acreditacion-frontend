import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Login} from './login/login';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';
import {LucideAngularModule, LogOut} from 'lucide-angular';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,FormsModule, LucideAngularModule ],
  templateUrl: './app.html',
})
export class App {
  protected title = 'plataforma-front';
  LogOut = LogOut;

  constructor(
    public authService: AuthService, // Se hace público para usarlo en la plantilla
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
