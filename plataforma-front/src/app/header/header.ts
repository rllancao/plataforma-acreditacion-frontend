import { Component } from '@angular/core'; // Se elimina OnInit porque ya no es necesario
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { LucideAngularModule, Building2, PlusCircle, UserPlus, Briefcase, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './header.html',
})
export class HeaderComponent { // Se elimina 'implements OnInit'
  // Iconos para la plantilla
  Building2 = Building2;
  PlusCircle = PlusCircle;
  UserPlus = UserPlus;
  Briefcase = Briefcase;
  LogOut = LogOut;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  // Se elimina ngOnInit, ya que la lógica ahora es reactiva.

  // ✅ CORRECCIÓN: Se convierte 'userRole' en un getter.
  // Esto asegura que el rol se verifique cada vez que Angular actualiza la vista.
  get userRole(): 'admin' | 'empresa' | null {
    return this.authService.getUserRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
