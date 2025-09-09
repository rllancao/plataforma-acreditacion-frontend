import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms'; // Importar FormControl
import { FaenaService, Faena, Cargo } from '../services/faena';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-modificar-faena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-faena.html', // Usando archivo externo
})
export class ModificarFaenaComponent implements OnInit {
  faena: Faena | null = null;
  addCargoForm: FormGroup;
  editCargoForm: FormGroup;
  editingCargoId: number | null = null;

  feedbackMessage = '';
  isError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private faenaService: FaenaService,
    private cd: ChangeDetectorRef
  ) {
    this.addCargoForm = this.fb.group({
      nombre: ['', Validators.required],
      vacantes: [0, [Validators.required, Validators.min(0)]],
    });
    this.editCargoForm = this.fb.group({
      nombre: ['', Validators.required],
      vacantes: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadFaenaData();
  }

  loadFaenaData(): void {
    const faenaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!faenaId) {
      this.router.navigate(['/select-faena']);
      return;
    }
    this.faenaService.getFaenaById(faenaId).subscribe(data => {
      this.faena = data;
      this.cd.detectChanges();
    });
  }

  agregarCargo(): void {
    if (this.addCargoForm.invalid || !this.faena) return;

    this.faenaService.addCargo(this.faena.id, this.addCargoForm.value).pipe(
      catchError(err => {
        this.showFeedback(err.error.message || 'Error al añadir el cargo.', true);
        return of(null);
      })
    ).subscribe(nuevoCargo => {
      if (nuevoCargo) {
        this.showFeedback('Cargo añadido exitosamente.');
        this.addCargoForm.reset({ vacantes: 0 });
        this.loadFaenaData();
      }
    });
  }

  iniciarEdicion(cargo: Cargo): void {
    this.editingCargoId = cargo.id;
    this.editCargoForm.setValue({ nombre: cargo.nombre, vacantes: cargo.vacantes });
  }

  cancelarEdicion(): void {
    this.editingCargoId = null;
  }

  guardarCambios(cargoId: number): void {
    if (this.editCargoForm.invalid || !this.faena) return;

    this.faenaService.updateCargo(this.faena.id, cargoId, this.editCargoForm.value).pipe(
      catchError(err => {
        this.showFeedback(err.error.message || 'Error al guardar los cambios.', true);
        return of(null);
      })
    ).subscribe(cargoActualizado => {
      if (cargoActualizado) {
        this.showFeedback('Cargo actualizado exitosamente.');
        this.cancelarEdicion();
        this.loadFaenaData();
      }
    });
  }

  eliminarCargo(cargoId: number): void {
    if (!this.faena || !confirm('¿Estás seguro de que quieres eliminar este cargo? Esta acción no se puede deshacer.')) {
      return;
    }

    this.faenaService.deleteCargo(this.faena.id, cargoId).pipe(
      catchError(err => {
        this.showFeedback(err.error.message || 'Error al eliminar el cargo.', true);
        return of(null);
      })
    ).subscribe(response => {
      if (response === null) return;
      this.showFeedback('Cargo eliminado exitosamente.');
      this.loadFaenaData();
    });
  }

  private showFeedback(message: string, isError = false): void {
    this.feedbackMessage = message;
    this.isError = isError;
    setTimeout(() => this.feedbackMessage = '', 5000);
  }

  // ✅ CORRECCIÓN: Getters para acceder a los form controls con el tipo correcto
  get editNombreControl(): FormControl {
    return this.editCargoForm.get('nombre') as FormControl;
  }

  get editVacantesControl(): FormControl {
    return this.editCargoForm.get('vacantes') as FormControl;
  }
}
