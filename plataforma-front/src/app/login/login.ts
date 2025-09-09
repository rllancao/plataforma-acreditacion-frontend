import { Component, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  hide = true;
  form: FormGroup;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMsg = '';

    this.authService.login(this.form.value).subscribe({
      next: () => {
        const userRole = this.authService.getUserRole();

        // Log para depurar el rol obtenido
        console.log('Rol de usuario detectado:', userRole);

        // ✅ CORRECCIÓN: Se agrupan los roles de administrador en una sola condición
        if (userRole === 'admin' || userRole === 'superAdmin') {
          this.router.navigate(['/admin']);
        } else if (userRole === 'empresa') {
          this.router.navigate(['/empresa-dashboard']);
        } else {
          // Para cualquier otro rol (como 'empleado')
          this.router.navigate(['/select-faena']);
        }
      },
      error: (err) => {
        this.errorMsg = 'El correo o la contraseña son incorrectos.';
        this.cd.detectChanges();
      }
    });
  }

  hasError(field: string, error: string) {
    const ctrl = this.form.get(field);
    return ctrl?.touched && ctrl.hasError(error);
  }
}
