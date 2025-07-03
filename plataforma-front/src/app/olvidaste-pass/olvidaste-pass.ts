// src/app/olvidaste-pass/olvidaste-pass.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule }   from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ResetPassService } from '../services/reset-password'; // Asegúrate de tener este servicio

import { LucideAngularModule } from 'lucide-angular';
import { Eye, EyeOff }         from 'lucide-angular';

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const conf = group.get('confirm')?.value;
  return pass && conf && pass !== conf ? { mismatch: true } : null;
}

@Component({
  selector: 'app-olvidaste-pass',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './olvidaste-pass.html',
  styleUrls: ['./olvidaste-pass.scss'],
})
export class OlvidastePass {
  /* iconos para el template */
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  step = 1;                  // 1: email • 2: código • 3: nueva pass • 4: éxito
  hide = true;
  errorMsg = '';            // Mensaje de error para mostrar en el template

  emailForm: FormGroup;
  codeForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder, public router: Router,private cd: ChangeDetectorRef, private resetPassService: ResetPassService) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.codeForm = this.fb.group({
      code: ['', Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm: ['', Validators.required],
      },
      { validators: passwordMatch }
    );
  }

  /* ───────────── Paso 1: enviar código ───────────── */
  sendCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    // TODO: Llamar servicio → enviar correo con código
    console.log('Código enviado a', this.emailForm.value.email);
    this.step = 2;
  }

  /* ───────────── Paso 2: verificar código ───────────── */
  verifyCode(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    // TODO: Verificar código en backend
    console.log('Código verificado:', this.codeForm.value.code);
    this.step = 3;
  }

  resendCode(): void {
    // TODO: Re-enviar código
    console.log('Reenviando código a', this.emailForm.value.email);
  }

  /* ───────────── Paso 3: guardar nueva contraseña ───── */
  resetPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.errorMsg = ''; // Limpia errores previos

    const email = this.emailForm.value.email;
    const newPassword = this.passwordForm.value.password;

    this.resetPassService.resetPassword(email, newPassword).subscribe({
      next: () => {
        console.log('Contraseña cambiada exitosamente');
        this.step = 4;

        // ✅ ¡CORRECCIÓN!
        // Forzamos la detección de cambios para que la vista se actualice al paso 4.
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudo actualizar la contraseña. Inténtalo de nuevo.';
        this.cd.detectChanges();
      },
    });
  }

  /* ───────────── Helpers de errores en template ─────── */
  hasError(form: FormGroup, ctrl: string, err: string): boolean {
    const c = form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }
}

