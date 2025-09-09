import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Faena, FaenaService, Cargo } from '../services/faena'; // Se importa Cargo
import { TrabajadorService } from '../services/trabajador';
import { VolverAtras } from '../volver-atras/volver-atras';
import { CustomValidators } from '../../utilities/custom-validatos';

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
  faenas: Faena[] = []; // Se usará un array en lugar de un Observable
  cargosDisponibles: Cargo[] = []; // Nueva propiedad para los cargos dinámicos
  selectedFaenaData: Faena | null = null; // Almacenará todos los datos de la faena seleccionada
  vacantesDisponibles: number | null = null; // Para mostrar al usuario
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

  bulkErrors: string[] = [];

  isSedeDropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private faenaService: FaenaService,
    private trabajadorService: TrabajadorService,
    private cd: ChangeDetectorRef
  ) {
    // Formulario para ingreso manual
    this.manualForm = this.fb.group({
      nombre: ['', [Validators.required, CustomValidators.nombreApellidoValidator()]],
      rut_pasaporte: ['', [Validators.required, CustomValidators.rutPasaporteValidator()]],
      genero: ['', Validators.required],
      edad: [{ value: '', disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      faenaId: ['', Validators.required],
      cargo: [{ value: '', disabled: true }, Validators.required],
      tipo_evaluacion: ['', Validators.required],
      sede_evaluacion: ['', Validators.required],
      fecha_atencion: ['', Validators.required],
      fecha_informe: ['', Validators.required],
      fecha_nacimiento: ['', [Validators.required, CustomValidators.minAgeValidator(18)]],
      direccion: ['', Validators.required],
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
    this.faenaService.getFaenas().subscribe(data => { this.faenas = data; });
    this.onNacimientoChange(); // Se activa la escucha para calcular la edad
  }
  onNacimientoChange(): void {
    this.manualForm.get('fecha_nacimiento')?.valueChanges.subscribe(value => {
      if (value) {
        const today = new Date();
        // Se añade 'T00:00:00' para asegurar que la fecha se interprete en la zona horaria local
        // y evitar problemas con fechas que cambian por un día.
        const birthDate = new Date(value + 'T00:00:00');

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        // Si el mes actual es anterior al de nacimiento, o si es el mismo mes
        // pero el día actual es anterior al día de nacimiento,
        // significa que la persona aún no ha cumplido años este año.
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        this.manualForm.get('edad')?.setValue(age, { emitEvent: false });
      } else {
        // Si se borra la fecha, se borra la edad.
        this.manualForm.get('edad')?.setValue('', { emitEvent: false });
      }
    });
  }

  // ✅ NUEVO: Lógica para actualizar los cargos cuando cambia la faena
  onFaenaChange(): void {
    const faenaId = this.manualForm.get('faenaId')?.value;
    const cargoControl = this.manualForm.get('cargo');

    // Resetea todo al cambiar de faena
    cargoControl?.reset({ value: '', disabled: true });
    this.cargosDisponibles = [];
    this.selectedFaenaData = null;
    this.vacantesDisponibles = null;

    if (faenaId) {
      // Hacemos una llamada para obtener los datos frescos de la faena, incluyendo sus trabajadores
      this.faenaService.getFaenaById(Number(faenaId)).subscribe(faenaData => {
        this.selectedFaenaData = faenaData;
        if (faenaData && faenaData.cargos) {
          this.cargosDisponibles = faenaData.cargos;
          cargoControl?.enable();
        }
      });
    }
  }

  onCargoChange(): void {
    const cargoId = this.manualForm.get('cargo')?.value; // Ahora esto será un ID
    this.vacantesDisponibles = null;

    if (cargoId && this.selectedFaenaData) {
      const cargoSeleccionado = this.cargosDisponibles.find(c => c.id === Number(cargoId));
      if (!cargoSeleccionado) return;

      const totalVacantes = cargoSeleccionado.vacantes;

      // ¡Importante! La lógica ahora debe contar trabajadores por el NOMBRE del cargo
      // para calcular las vacantes restantes de esa tanda específica.
      const trabajadoresEnCargo = this.selectedFaenaData.trabajadores.filter(
        t => t.cargo === cargoSeleccionado.nombre // Comparamos por nombre para el cálculo local
      ).length;

      this.vacantesDisponibles = totalVacantes - trabajadoresEnCargo;
    }
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
    this.manualMsg = '';
    if (this.manualForm.invalid) {
      this.manualMsg = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    // VALIDACIÓN CLAVE: Se comprueba si quedan vacantes disponibles
    if (this.vacantesDisponibles !== null && this.vacantesDisponibles <= 0) {
      this.manualMsg = 'No quedan vacantes disponibles para el cargo seleccionado en esta faena.';
      return;
    }

    const formValue = this.manualForm.getRawValue();
    const payload = {
      ...formValue,
      // Renombramos la propiedad 'cargo' (que tiene el ID) a 'cargoId' para que coincida con el nuevo DTO del backend.
      faenaId: Number(formValue.faenaId),
      cargoId: formValue.cargo,
    };
    delete payload.cargo; // Eliminamos la propiedad original
    this.trabajadorService.createTrabajador(payload).subscribe({
      next: () => {
        this.manualMsg = 'Trabajador creado exitosamente.';
        const currentFaenaId = this.manualForm.get('faenaId')?.value;
        this.onFaenaChange(); // Recargamos los datos para recalcular vacantes
        this.manualForm.reset({ faenaId: currentFaenaId, cargo: { value: '', disabled: true } });
      },
      error: (err) => (this.manualMsg = err.error?.message[0] || err.error.message || 'Error al crear trabajador.'),
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.manualForm.get(name);
  }

  submitBulk(): void {
    if (this.bulkForm.invalid || !this.selectedFile) return;
    this.bulkMsg = '';
    this.bulkErrors = [];

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('faenaId', this.bulkForm.get('faenaId')?.value);

    this.trabajadorService.createTrabajadoresBulk(formData).subscribe({
      next: (res) => {
        this.bulkMsg = `${res.createdCount} trabajadores importados exitosamente.`;
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error && Array.isArray(err.error.message)) {
          this.bulkMsg = 'El archivo contiene errores. Por favor, corrígelos y vuelve a intentarlo.';
          this.bulkErrors = err.error.message;
        } else {
          this.bulkMsg = 'Ocurrió un error inesperado al importar el archivo.';
        }
        this.cd.detectChanges();
      },
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
