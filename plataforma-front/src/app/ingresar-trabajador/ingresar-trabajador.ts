import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Faena, FaenaService } from '../services/faena';
import { TrabajadorService } from '../services/trabajador';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-ingresar-trabajador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VolverAtras],
  templateUrl: './ingresar-trabajador.html',
})
export class IngresarTrabajadorComponent implements OnInit {
  // Formularios
  manualForm: FormGroup;
  bulkForm: FormGroup;
  deleteForm: FormGroup;

  // Datos para selectores
  faenas$!: Observable<Faena[]>;
  selectedFile: File | null = null;
  centros: string[] = ['CENTRO DE SALUD WORKMED SANTIAGO',
    'CENTRO DE SALUD WORKMED SANTIAGO PISO 6',
    'CENTRO DE SALUD WORKMED CONCEPCION',
    'CENTRO DE SALUD WORKMED LA SERENA',
    'CENTRO DE SALUD WORKMED CALAMA',
    'CENTRO DE SALUD WORKMED VIÑA DEL MAR',
    'CENTRO DE SALUD WORKMED IQUIQUE',
    'CENTRO DE SALUD WORKMED ARICA',
    'CENTRO DE SALUD WORKMED ANTOFAGASTA',
    'CENTRO DE SALUD WORKMED CALAMA GRANADEROS',
    'CENTRO DE SALUD WORKMED RANCAGUA',
    'CENTRO DE SALUD WORKMED COPIAPÓ',
    'CENTRO DE SALUD WORKMED PUERTO MONTT',
    'CENTRO DE SALUD WORKMED DIEGO DE ALMAGRO',
    'CENTRO DE SALUD WORKMED TERRENO',
    'CENTRO DE SALUD WORKMED - BIONET VIÑA DEL MAR',
    'CENTRO DE SALUD WORKMED TELECONSULTA',
    'CENTRO DE SALUD WORKMED - BIONET QUILLOTA',
    'CENTRO DE SALUD WORKMED - BIONET RENGO',
    'CENTRO DE SALUD WORKMED - BIONET SAN ANTONIO',
    'CENTRO DE SALUD WORKMED BIONET - CURICO',
    'CENTRO DE SALUD WORKMED - BIONET IQUIQUE',
    'CENTRO DE SALUD WORKMED AREQUIPA, PERÚ',
    'CENTRO DE SALUD WORKMED - BIONET LOS ANDES',
  ];

    // Mensajes de feedback
  manualMsg = '';
  bulkMsg = '';
  deleteMsg = '';

  isSedeDropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private faenaService: FaenaService,
    private trabajadorService: TrabajadorService,
  ) {
    // Formulario para ingreso manual
    this.manualForm = this.fb.group({
      nombre: ['', Validators.required],
      rut_pasaporte: ['', Validators.required],
      genero: ['', Validators.required],
      edad: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      cargo: ['', Validators.required],
      faenaId: ['', Validators.required],
      tipo_evaluacion: ['', Validators.required],
      sede_evaluacion: ['', Validators.required],
      fecha_atencion: ['', Validators.required],
      fecha_informe: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      // ... puedes añadir todos los demás campos aquí
    });

    // Formulario para importación masiva
    this.bulkForm = this.fb.group({
      faenaId: ['', Validators.required],
      file: [null, Validators.required],
    });

    // Formulario para eliminación
    this.deleteForm = this.fb.group({
      rut: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.faenas$ = this.faenaService.getFaenas();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    this.selectedFile = element.files ? element.files[0] : null;
  }

  toggleSedeDropdown(): void {
    this.isSedeDropdownOpen = !this.isSedeDropdownOpen;
  }

  selectSede(centro: string): void {
    this.manualForm.get('sede_evaluacion')?.setValue(centro);
    this.isSedeDropdownOpen = false;
  }

  // --- Lógica de Submisión ---

  submitManual(): void {
    if (this.manualForm.invalid) return;
    this.manualMsg = '';
    this.trabajadorService.createTrabajador(this.manualForm.value).subscribe({
      next: () => {
        this.manualMsg = 'Trabajador creado exitosamente.';
        this.manualForm.reset();
      },
      error: (err) => (this.manualMsg = 'Error al crear trabajador.'),
    });
  }

  submitBulk(): void {
    if (this.bulkForm.invalid || !this.selectedFile) return;
    this.bulkMsg = '';
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('faenaId', this.bulkForm.get('faenaId')?.value);

    this.trabajadorService.createTrabajadoresBulk(formData).subscribe({
      next: (res) => (this.bulkMsg = `${res.createdCount} trabajadores importados.`),
      error: (err) => (this.bulkMsg = 'Error al importar archivo.'),
    });
  }

  submitDelete(): void {
    if (this.deleteForm.invalid) return;
    this.deleteMsg = '';
    const rut = this.deleteForm.get('rut')?.value;
    this.trabajadorService.deleteTrabajadorByRut(rut).subscribe({
      next: () => {
        this.deleteMsg = `Trabajador con RUT ${rut} eliminado.`;
        this.deleteForm.reset();
      },
      error: (err) => (this.deleteMsg = err.error.message || 'Error al eliminar.'),
    });
  }
}
