import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-ingresar-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VolverAtras],
  templateUrl: './ingresar-empresa.html',
})
export class IngresarEmpresaComponent {
  empresaForm: FormGroup;
  feedbackMsg = '';
  isError = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.empresaForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    }
    this.feedbackMsg = '';
    this.isError = false;

    this.usuarioService.createEmpresa(this.empresaForm.value).subscribe({
      next: () => {
        this.feedbackMsg = '¡Empresa creada exitosamente!';
        this.empresaForm.reset();
        setTimeout(() => this.router.navigate(['/admin']), 2000);
      },
      error: (err) => {
        this.feedbackMsg = err.error.message || 'Error al crear la empresa.';
        this.isError = true;
      }
    });
  }
}
