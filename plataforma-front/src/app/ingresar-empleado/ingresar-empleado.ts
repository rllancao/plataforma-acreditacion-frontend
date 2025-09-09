import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaenaService, Faena } from '../services/faena';
import { UsuarioService } from '../services/usuario';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-ingresar-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VolverAtras],
  templateUrl: './ingresar-empleado.html',
})
export class IngresarEmpleadoComponent implements OnInit {
  userForm: FormGroup;
  faenas: Faena[] = [];
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private faenaService: FaenaService,
    private usuarioService: UsuarioService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      faenas: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    // Obtener las faenas de la empresa actual
    this.faenaService.getFaenas().subscribe(data => {
      this.faenas = data;
      this.addFaenaCheckboxes();
    });
  }

  get faenasFormArray() {
    return this.userForm.get('faenas') as FormArray;
  }

  private addFaenaCheckboxes() {
    this.faenas.forEach(() => this.faenasFormArray.push(new FormControl(false)));
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.errorMsg = '';
    this.successMsg = '';

    const rawValue = this.userForm.value;
    const selectedFaenaIds = rawValue.faenas
      .map((checked: boolean, i: number) => checked ? this.faenas[i].id : null)
      .filter((id: number | null) => id !== null);

    const payload = {
      nombre: rawValue.nombre,
      email: rawValue.email,
      password: rawValue.password,
      faenaIds: selectedFaenaIds,
    };

    this.usuarioService.createEmpleado(payload).subscribe({
      next: () => {
        this.successMsg = '¡Usuario creado exitosamente! Serás redirigido en 3 segundos...';
        this.userForm.reset();

        // Forzar la actualización de la UI para mostrar el mensaje de éxito
        this.cd.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/empresa-dashboard']);
        }, 3000);
      },
      error: (err) => {

        this.errorMsg = err.error.message || 'Ocurrió un error al crear el usuario.';

        // ✅ CORRECCIÓN: Forzar la detección de cambios para asegurar que la UI se actualice
        setTimeout(() => {
          this.cd.detectChanges();
        }, 1000);
      }
    });
  }
}
