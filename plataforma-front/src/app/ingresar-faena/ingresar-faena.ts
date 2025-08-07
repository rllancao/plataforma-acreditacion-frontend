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
  seccionesRequisitos: SeccionRequisito[] = [];
  empresas$!: Observable<Empresa[]>;

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

  getFormControlIndex(seccionIndex: number, docIndex: number): number {
    let currentIndex = 0;
    for (let i = 0; i < seccionIndex; i++) {
      currentIndex += this.seccionesRequisitos[i].documentos.length;
    }
    return currentIndex + docIndex;
  }
}
