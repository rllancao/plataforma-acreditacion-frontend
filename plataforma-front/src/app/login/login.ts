// src/app/login/login.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


// Importa el módulo y los iconos
import { LucideAngularModule } from 'lucide-angular';
import { Eye, EyeOff } from 'lucide-angular';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,      // todo el módulo, sin pick()
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  // Exponemos los iconos para usarlos con [img]
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;





  hide = true;
  form: FormGroup;
  errorMsg = '';
  // Credenciales de ejemplo para el administrador

  private readonly adminCreds = {
    email: 'admin@demo.local',
    password: '123456',
  };

  constructor(private fb: FormBuilder,private router: Router) {
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
    const { email, password } = this.form.value;
    if (email === 'admin@demo.local' && password === '123456') {
      this.router.navigate(['/select-faena']);   // redirige
    } else {
      alert('Credenciales incorrectas');
    }
  }

  hasError(field: string, error: string) {
    const ctrl = this.form.get(field);
    return ctrl?.touched && ctrl.hasError(error);
  }
}
