// src/app/olvidaste-pass/olvidaste-pass.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ResetPassService } from '../services/reset-password';

import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

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
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  step = 1;
  hide = true;
  errorMsg = '';
  successMsg = '';
  private resetToken: string | null = null;

  emailForm: FormGroup;
  codeForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private cd: ChangeDetectorRef,
    private resetPassService: ResetPassService
  ) {
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

  private clearMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  sendCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.clearMessages();

    this.resetPassService.sendCode(this.emailForm.value.email).subscribe({
      next: () => {
        this.successMsg = 'Código enviado. Revisa tu bandeja de entrada.';
        this.step = 2;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMsg = 'No se pudo procesar la solicitud. Inténtalo de nuevo.';
        this.cd.detectChanges();
      },
    });
  }

  verifyCode(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.clearMessages();

    const email = this.emailForm.value.email;
    const code = this.codeForm.value.code;

    this.resetPassService.verifyCode(email, code).subscribe({
      next: (response) => {
        if (response && response.reset_token) {
          this.resetToken = response.reset_token;
          this.successMsg = '¡Código correcto!';
          this.step = 3;
          this.cd.detectChanges();
        } else {
          this.errorMsg = 'Respuesta inesperada del servidor.';
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.errorMsg = 'El código es incorrecto o ha expirado.';
        this.cd.detectChanges();
      },
    });
  }

  resendCode(): void {
    this.clearMessages();
    this.resetPassService.sendCode(this.emailForm.value.email).subscribe({
      next: () => {
        this.successMsg = 'Se ha reenviado un nuevo código a tu correo.';
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMsg = 'No se pudo reenviar el código. Inténtalo de nuevo.';
        this.cd.detectChanges();
      },
    });
  }

  resetPassword(): void {
    // ✅ CORRECCIÓN: Se asigna a una constante local para ayudar a TypeScript
    const token = this.resetToken;

    if (this.passwordForm.invalid || !token) {
      this.errorMsg = 'Token de reseteo inválido. Por favor, reinicia el proceso.';
      return;
    }
    this.clearMessages();

    const email = this.emailForm.value.email;
    const newPassword = this.passwordForm.value.password;

    // Se usa la constante local 'token', que TypeScript ahora sabe que es un string
    this.resetPassService.resetPassword(email, newPassword, token).subscribe({
      next: () => {
        console.log('Contraseña cambiada exitosamente');
        this.step = 4;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMsg = 'No se pudo actualizar la contraseña. El token puede haber expirado.';
        this.cd.detectChanges();
      },
    });
  }

  hasError(form: FormGroup, ctrl: string, err: string): boolean {
    const c = form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }
}
