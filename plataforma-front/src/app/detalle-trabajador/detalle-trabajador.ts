import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import { Trabajador, TrabajadorService, DocumentoRequisito } from '../services/trabajador';
import { Documentos, DocumentoService } from '../services/documentos';
import { AuthService } from '../services/auth';
import { VolverAtras } from '../volver-atras/volver-atras';

Chart.register(...registerables);

@Component({
  selector: 'app-detalle-trabajador',
  standalone: true,
  imports: [CommonModule, VolverAtras, RouterModule, ReactiveFormsModule],
  templateUrl: './detalle-trabajador.html',
})
export class DetalleTrabajadorComponent implements OnInit, OnDestroy {
  trabajador: Trabajador | null = null;
  documentos: Documentos[] = [];
  documentosPorSeccion: { [seccion: string]: Documentos[] } = {};
  userRole: 'admin' | 'empresa' | null = null;

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  requisitosPorSeccion: { [key: string]: DocumentoRequisito[] } = {};
  nombresDocumentosDisponibles: DocumentoRequisito[] = [];
  errorMsg = '';
  successMsg = '';

  private routeSub?: Subscription;
  private chartInstance?: Chart;

  @ViewChild('docsChart') docsChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private trabajadorService: TrabajadorService,
    private documentoService: DocumentoService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.uploadForm = new FormGroup({
      seccion: new FormControl('', [Validators.required]),
      nombre: new FormControl({ value: '', disabled: true }, [Validators.required]),
      file: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.loadData();
  }

  loadData(): void {
    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) return forkJoin({ trabajador: of(null), documentos: of([]) });

        return forkJoin({
          trabajador: this.trabajadorService.getTrabajadorById(id),
          documentos: this.documentoService.getDocsByTrabajador(id)
        });
      })
    ).subscribe(result => {
      if (result.trabajador) {
        this.trabajador = result.trabajador;
        this.documentos = result.documentos;
        this.groupDocumentsBySection();
        this.buildRequisitosMap();
        this.cd.detectChanges(); // Forzar la detección de cambios
        this.createDocsChart();
      }
    });
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

  groupDocumentsBySection(): void {
    this.documentosPorSeccion = this.documentos.reduce((acc, doc) => {
      (acc[doc.seccion] = acc[doc.seccion] || []).push(doc);
      return acc;
    }, {} as { [seccion: string]: Documentos[] });
  }

  createDocsChart(): void {
    if (this.docsChartCanvas && this.trabajador) {
      if (this.chartInstance) this.chartInstance.destroy();

      const context = this.docsChartCanvas.nativeElement.getContext('2d');
      if (context) {
        const totalRequeridos = this.trabajador.faenaRelacion.documentosRequeridos?.length || 0;
        const completados = this.documentos.length;
        const faltantes = Math.max(0, totalRequeridos - completados);

        this.chartInstance = new Chart(context, {
          type: 'doughnut',
          data: {
            labels: ['Completados', 'Faltantes'],
            datasets: [{
              data: [completados, faltantes],
              backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
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
      next: () => {
        this.successMsg = '¡Documento subido exitosamente!';
        this.uploadForm.reset({ seccion: '', nombre: { value: '', disabled: true } });
        this.selectedFile = null;
        this.loadData();
      },
      error: (err) => {
        this.errorMsg = 'Error al subir el documento.';
        this.cd.detectChanges();
      }
    });
  }

  viewDocument(docId: number): void {
    this.documentoService.viewDocument(docId).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    });
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
