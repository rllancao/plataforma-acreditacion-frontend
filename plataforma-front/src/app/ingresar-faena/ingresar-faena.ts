import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RequisitosService, SeccionRequisito } from '../services/requisitos';
import { FaenaService } from '../services/faena';
import { UsuarioService, Empresa } from '../services/usuario';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-ingresar-faena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VolverAtras],
  templateUrl: './ingresar-faena.html',
})
export class IngresarFaenaComponent implements OnInit {
  faenaForm: FormGroup;
  nuevoRequisitoForm: FormGroup;
  seccionesRequisitos: SeccionRequisito[] = [];
  empresas$!: Observable<Empresa[]>;

  requisitoSuccessMsg = '';
  requisitoErrorMsg = '';

  private requisitoIdMap: number[] = [];

  constructor(
    private fb: FormBuilder,
    private requisitosService: RequisitosService,
    private faenaService: FaenaService,
    private usuarioService: UsuarioService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.faenaForm = this.fb.group({
      nombre: ['', Validators.required],
      ciudad: ['', Validators.required],
      usuarioId: ['', Validators.required],
      requisitos: this.fb.array([]),
    });

    this.nuevoRequisitoForm = this.fb.group({
      seccionId: ['', Validators.required],
      nombre: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.empresas$ = this.usuarioService.getEmpresas();

    this.requisitosService.getRequisitos().subscribe(data => {
      this.seccionesRequisitos = data;
      this.buildRequisitosCheckboxes();
      this.cd.detectChanges();
    });
  }

  get requisitosFormArray() {
    return this.faenaForm.get('requisitos') as FormArray;
  }

  buildRequisitosCheckboxes() {
    this.requisitosFormArray.clear();
    this.requisitoIdMap = [];

    this.seccionesRequisitos.forEach(seccion => {
      seccion.documentos.forEach(doc => {
        this.requisitoIdMap.push(doc.id);
        this.requisitosFormArray.push(new FormControl(false));
      });
    });
  }

  // ✅ NUEVO MÉTODO: Marca todos los checkboxes
  selectAll(): void {
    this.requisitosFormArray.controls.forEach(control => {
      control.setValue(true);
    });
  }

  // ✅ NUEVO MÉTODO: Desmarca todos los checkboxes
  deselectAll(): void {
    this.requisitosFormArray.controls.forEach(control => {
      control.setValue(false);
    });
  }

  onSubmit(): void {
    if (this.faenaForm.invalid) {
      this.faenaForm.markAllAsTouched();
      return;
    }

    const rawFormValue = this.faenaForm.value;

    const selectedRequisitoIds = rawFormValue.requisitos
      .map((checked: boolean, i: number) => checked ? this.requisitoIdMap[i] : null)
      .filter((id: number | null) => id !== null);

    const payload = {
      ...rawFormValue,
      usuarioId: Number(rawFormValue.usuarioId),
      requisitoIds: selectedRequisitoIds
    };
    delete payload.requisitos;

    this.faenaService.createFaena(payload).subscribe(() => {
      alert('¡Faena creada exitosamente!');
      this.router.navigate(['/admin']);
    });
  }

  loadRequisitos(): void {
    this.requisitosService.getRequisitos().subscribe(data => {
      this.seccionesRequisitos = data;
      this.buildRequisitosCheckboxes();
      this.cd.detectChanges();
    });
  }

  onNuevoRequisitoSubmit(): void {
    if (this.nuevoRequisitoForm.invalid) return;
    this.clearRequisitoMessages();

    const formValue = this.nuevoRequisitoForm.value;
    const payload = {
      nombre: formValue.nombre,
      seccionId: Number(formValue.seccionId)
    };

    this.requisitosService.createRequisito(payload).subscribe({
      next: () => {
        this.requisitoSuccessMsg = `El requisito "${payload.nombre}" ha sido añadido exitosamente.`;
        this.nuevoRequisitoForm.reset({ seccionId: '', nombre: '' });
        this.loadRequisitos();

        // ✅ CORRECCIÓN: Se fuerza la detección de cambios para mostrar el mensaje
        this.cd.detectChanges();

        setTimeout(() => {
          this.clearRequisitoMessages();
          this.cd.detectChanges(); // También es bueno limpiar el mensaje en la zona de Angular
        }, 5000);
      },
      error: (err) => {
        this.requisitoErrorMsg = 'Error al añadir el requisito.';
        console.error(err);
        this.cd.detectChanges();
      }
    });
  }
  clearRequisitoMessages(): void {
    this.requisitoSuccessMsg = '';
    this.requisitoErrorMsg = '';
  }

  getFormControlIndex(seccionIndex: number, docIndex: number): number {
    let currentIndex = 0;
    for (let i = 0; i < seccionIndex; i++) {
      currentIndex += this.seccionesRequisitos[i].documentos.length;
    }
    return currentIndex + docIndex;
  }
}
