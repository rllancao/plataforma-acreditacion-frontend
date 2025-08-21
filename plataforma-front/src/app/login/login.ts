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
        // ✅ LÓGICA DE REDIRECCIÓN POR ROL
        const userRole = this.authService.getUserRole();

        if (userRole === 'admin') {
          // Si es admin, redirige al panel de administración
          this.router.navigate(['/admin']);
        }
        else if (userRole === 'empresa'){
          this.router.navigate(['/empresa-dashboard']);
        }
        else {
          // Si es empleado, redirige al selector de faenas
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
