import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { FormBuilder} from '@angular/forms';

import { Trabajador, TrabajadorService, DocumentoRequisito } from '../services/trabajador';
import { Documentos, DocumentoService } from '../services/documentos';
import { AuthService } from '../services/auth';
import { VolverAtras } from '../volver-atras/volver-atras';

Chart.register(...registerables);

export interface DocumentoChecklistItem {
  requisito: DocumentoRequisito;
  documentoSubido: Documentos | null;
  estado: 'Completado' | 'Pendiente' | 'Rechazado';
  observacion: string;
  fechaVencimiento: string;
}

@Component({
  selector: 'app-detalle-trabajador',
  standalone: true,
  imports: [CommonModule, VolverAtras, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './detalle-trabajador.html',
})
export class DetalleTrabajadorComponent implements OnInit, OnDestroy {
  trabajador: Trabajador | null = null;
  documentos: Documentos[] = [];
  documentosPorSeccion: { [seccion: string]: Documentos[] } = {};
  userRole: 'admin' | 'empresa' | 'empleado' | 'superAdmin' | null = null;
  backLink: any[] | null = null;

  uploadForm: FormGroup;
  fechaInformeForm: FormGroup;
  isEditingFechaInforme = false;
  selectedFile: File | null = null;
  requisitosPorSeccion: { [key: string]: DocumentoRequisito[] } = {};
  nombresDocumentosDisponibles: DocumentoRequisito[] = [];
  errorMsg = '';
  successMsg = '';

  private routeSub?: Subscription;
  private chartInstance?: Chart;
  private platformId = inject(PLATFORM_ID);

  @ViewChild('docsChart') docsChartCanvas!: ElementRef<HTMLCanvasElement>;

  documentosChecklist: { [seccion: string]: DocumentoChecklistItem[] } = {};

  constructor(
    private route: ActivatedRoute,
    private trabajadorService: TrabajadorService,
    private documentoService: DocumentoService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.uploadForm = new FormGroup({
      seccion: new FormControl('', [Validators.required]),
      nombre: new FormControl({ value: '', disabled: true }, [Validators.required]),
      file: new FormControl(null, [Validators.required]),
    });

    this.fechaInformeForm = this.fb.group({
      fecha_informe: ['', Validators.required]
    });
    console.log('[DEBUG] Constructor: backLink inicial es', this.backLink);

  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    console.log('[DEBUG] ngOnInit: Iniciando carga de datos...');
    this.loadData();

  }


  loadData(): void {
    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        console.log(`[DEBUG] Obtenido ID de la URL: ${id}`);
        if (!id) return forkJoin({ trabajador: of(null), documentos: of([]) });

        return forkJoin({
          trabajador: this.trabajadorService.getTrabajadorById(id),
          documentos: this.documentoService.getDocsByTrabajador(id)
        });
      })
    ).subscribe(result => {
      console.log('[DEBUG] Datos recibidos de la API:', result);
      if (result.trabajador) {
        this.trabajador = result.trabajador;
        this.documentos = result.documentos;

        if (this.trabajador.faenaRelacion?.id) {
          console.log(`[DEBUG] Faena ID encontrada: ${this.trabajador.faenaRelacion.id}. Construyendo backLink...`);
          this.backLink = ['/dashboard', this.trabajador.faenaRelacion.id];
          console.log('[DEBUG] backLink asignado a:', this.backLink);
        } else {
          console.error('[DEBUG] ¡ERROR! No se encontró faenaRelacion.id en el objeto trabajador. El backLink no se pudo construir.');
          // Como fallback, podrías asignar una ruta por defecto aquí si es necesario
          // this.backLink = ['/select-faena'];
        }
        console.log('[DEBUG] backLink asignado de nuevo a:', this.backLink);

        this.buildChecklist();
        this.buildRequisitosMap();
        console.log('[DEBUG] Forzando detección de cambios...');
        this.cd.detectChanges();
        console.log('[DEBUG] Despues de forzar: backLink asignado a:', this.backLink);
        console.log('[DEBUG] Detección de cambios completada.');
        this.createDocsChart();
        console.log('[DEBUG] Despues de grafico: backLink asignado a:', this.backLink);
      }
    });
  }


  toggleEditFechaInforme(isEditing: boolean): void {
    this.isEditingFechaInforme = isEditing;
    if (!isEditing && this.trabajador) {
      // Si se cancela, se resetea el formulario al valor original
      this.fechaInformeForm.patchValue({
        fecha_informe: formatDate(this.trabajador.fecha_informe, 'yyyy-MM-dd', 'en-US')
      });
    }
  }


  onUpdateFechaInforme(): void {
    if (!this.trabajador || this.fechaInformeForm.invalid) {
      return;
    }
    const nuevaFecha = this.fechaInformeForm.value.fecha_informe;
    this.trabajadorService.updateFechaInforme(this.trabajador.id, nuevaFecha).subscribe({
      next: (trabajadorActualizado) => {
        this.trabajador!.fecha_informe = trabajadorActualizado.fecha_informe;
        this.toggleEditFechaInforme(false); // Salir del modo de edición
        alert('Fecha actualizada exitosamente.');
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar la fecha:', err);
        alert('No se pudo actualizar la fecha.');
      }
    });
  }

  marcarComoNoAplica(item: DocumentoChecklistItem): void {
    if (!this.trabajador) return;

    const payload = {
      trabajadorId: this.trabajador.id,
      nombre: item.requisito.nombre,
      seccion: item.requisito.seccion.nombre,
    };

    this.documentoService.marcarComoNoAplica(payload).subscribe({
      next: (newlyCreatedDocument) => {
        this.successMsg = `"${item.requisito.nombre}" marcado como 'No aplica'.`;
        this.documentos.push(newlyCreatedDocument);
        this.buildChecklist();
        this.createDocsChart();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMsg = 'Error al marcar como "No aplica".';
        console.error(err);
        this.cd.detectChanges();
      }
    });
  }

  buildChecklist(): void {
    const checklist: { [seccion: string]: DocumentoChecklistItem[] } = {};
    const documentosSubidosMap = new Map(this.documentos.map(doc => [doc.nombre, doc]));

    this.trabajador?.faenaRelacion.documentosRequeridos.forEach(req => {
      const seccionNombre = req.seccion?.nombre || 'General';
      if (!checklist[seccionNombre]) {
        checklist[seccionNombre] = [];
      }

      const docSubido = documentosSubidosMap.get(req.nombre) || null;

      checklist[seccionNombre].push({
        requisito: req,
        documentoSubido: docSubido,
        estado: docSubido ? docSubido.status : 'Pendiente',
        observacion: docSubido?.observacion || '',
        fechaVencimiento: docSubido?.fechaVencimiento ? formatDate(docSubido.fechaVencimiento, 'yyyy-MM-dd', 'en-US') : '',
      });
    });
    this.documentosChecklist = checklist;
  }

  buildRequisitosMap(): void {
    if (!this.trabajador?.faenaRelacion.documentosRequeridos) return;
    this.requisitosPorSeccion = this.trabajador.faenaRelacion.documentosRequeridos.reduce((acc, req) => {
      const seccionNombre = req.seccion?.nombre || 'General';
      (acc[seccionNombre] = acc[seccionNombre] || []).push(req);
      return acc;
    }, {} as { [key: string]: DocumentoRequisito[] });
  }

  onSeccionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const seccionSeleccionada = selectElement.value;
    const nombreControl = this.uploadForm.get('nombre');

    if (seccionSeleccionada && this.requisitosPorSeccion[seccionSeleccionada]) {
      this.nombresDocumentosDisponibles = this.requisitosPorSeccion[seccionSeleccionada];
      nombreControl?.enable();
    } else {
      this.nombresDocumentosDisponibles = [];
      nombreControl?.disable();
    }
    nombreControl?.reset('');
  }

  createDocsChart(): void {
    if (isPlatformBrowser(this.platformId) && this.docsChartCanvas && this.trabajador) {
      if (this.chartInstance) this.chartInstance.destroy();
      const context = this.docsChartCanvas.nativeElement.getContext('2d');
      if (context) {
        const items = Object.values(this.documentosChecklist).flat();
        const completados = items.filter(item => item.estado === 'Completado').length;
        const pendientes = items.filter(item => item.estado === 'Pendiente').length;
        const rechazados = items.filter(item => item.estado === 'Rechazado').length;

        this.chartInstance = new Chart(context, {
          type: 'doughnut',
          data: {
            labels: ['Completados', 'Pendientes', 'Rechazados'],
            datasets: [{
              data: [completados, pendientes, rechazados],
              backgroundColor: ['rgb(34, 197, 94)', 'rgb(250, 204, 21)', 'rgb(239, 68, 68)'],
              borderColor: '#fff',
              borderWidth: 2,
              hoverOffset: 4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  }

  triggerFileUpload(requisito: DocumentoRequisito): void {
    this.uploadForm.patchValue({
      seccion: requisito.seccion.nombre,
      nombre: requisito.nombre,
    });
    document.querySelector('#upload-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  onStatusChange(item: DocumentoChecklistItem, newStatus: string): void {
    if (!item.documentoSubido) return;
    this.documentoService.updateDocument(item.documentoSubido.id, { status: newStatus }).subscribe(() => {
      this.loadData();
    });
  }

  saveObservation(item: DocumentoChecklistItem): void {
    if (!item.documentoSubido) return;
    this.documentoService.updateDocument(item.documentoSubido.id, { observacion: item.observacion }).subscribe(() => {
      alert('Observación guardada.');
      this.loadData();
    });
  }

  onDateChange(item: DocumentoChecklistItem, event: Event): void {
    if (!item.documentoSubido) return;
    const newDate = (event.target as HTMLInputElement).value;
    item.fechaVencimiento = newDate;
    this.documentoService.updateDocument(item.documentoSubido.id, { fechaVencimiento: newDate }).subscribe(() => {
      // Opcional: mostrar un feedback de guardado
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files ? element.files[0] : null;
    if (file) {
      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file });
    } else {
      this.selectedFile = null;
      this.uploadForm.patchValue({ file: null });
    }
  }

  uploadDocument(): void {
    if (this.uploadForm.invalid || !this.selectedFile || !this.trabajador) return;
    this.clearMessages();

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('nombre', this.uploadForm.get('nombre')?.value);
    formData.append('seccion', this.uploadForm.get('seccion')?.value);
    formData.append('trabajadorId', this.trabajador.id.toString());

    this.documentoService.uploadDocument(formData).subscribe({
      // ✅ CORRECCIÓN: Se recibe el nuevo documento desde el backend
      next: (newlyCreatedDocument: Documentos) => {
        this.successMsg = '¡Documento subido exitosamente!';
        this.uploadForm.reset({ seccion: '', nombre: { value: '', disabled: true } });
        this.selectedFile = null;

        // Se actualiza el estado del componente directamente, sin volver a llamar a la API
        this.documentos.push(newlyCreatedDocument);
        this.buildChecklist();
        this.createDocsChart();
        this.cd.detectChanges(); // Se asegura de que la vista se actualice
      },
      error: (err) => {
        this.errorMsg = 'Error al subir el documento.';
        this.cd.detectChanges();
      }
    });
  }

  viewDocument(docId: number): void {
    const url = this.documentoService.getViewDocumentUrl(docId);

    // Obtenemos el token para añadirlo a la URL, ya que window.open
    // no usa el interceptor de Angular.
    const token = localStorage.getItem('access_token');

    if (token) {
      // El backend está configurado para leer el token desde este parámetro.
      window.open(`${url}?token=${token}`, '_blank');
    } else {
      console.error('No se encontró el token de autenticación.');
      // Opcional: redirigir al login o mostrar un error.
    }
  }

  deleteDocument(docId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
      this.documentoService.deleteDocument(docId).subscribe({
        next: () => {
          this.successMsg = 'Documento eliminado exitosamente.';
          this.loadData();
        },
        error: (err) => {
          this.errorMsg = 'Error al eliminar el documento.';
          console.error(err);
          this.cd.detectChanges();
        }
      });
    }
  }

  downloadAll(): void {
    if (!this.trabajador) return;
    this.documentoService.downloadAllAsZip(this.trabajador.id).subscribe({
      next: (blob) => {
        saveAs(blob, `documentos-${this.trabajador?.nombre?.replace(/\s+/g, '_') || this.trabajador?.id}.zip`);
      },
      error: (err) => {
        this.errorMsg = 'No se pudo descargar el archivo .zip.';
        this.cd.detectChanges();
        console.error('Error al descargar el archivo zip:', err);
      }
    });
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.chartInstance?.destroy();
  }
}
