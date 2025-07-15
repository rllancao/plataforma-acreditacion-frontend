import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { forkJoin, Subscription, of } from 'rxjs'; // 1. Importar 'of' de RxJS
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import { Trabajador, TrabajadorService } from '../services/trabajador';
import { Documentos, DocumentoService } from '../services/documentos';
import { AuthService } from '../services/auth';
import { VolverAtras } from '../volver-atras/volver-atras';

Chart.register(...registerables);

@Component({
  selector: 'app-detalle-trabajador',
  standalone: true,
  imports: [CommonModule, VolverAtras, RouterModule, ReactiveFormsModule],
  templateUrl: './detalle-trabajador.html'
})
export class DetalleTrabajadorComponent implements OnInit, OnDestroy {
  trabajador: Trabajador | null = null;
  documentos: Documentos[] = [];
  documentosPorSeccion: { [seccion: string]: Documentos[] } = {};
  userRole: 'admin' | 'empresa' | null = null;

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  errorMsg = '';
  successMsg = '';

  private routeSub?: Subscription;
  private chartInstance?: Chart;
  private platformId = inject(PLATFORM_ID);

  @ViewChild('docsChart') docsChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private trabajadorService: TrabajadorService,
    private documentoService: DocumentoService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.uploadForm = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      seccion: new FormControl('', [Validators.required]),
      file: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          // 2. CORRECCIÓN: Usar 'of(null)' para devolver un observable de un valor nulo
          return forkJoin({ trabajador: of(null), documentos: of([]) });
        }

        return forkJoin({
          trabajador: this.trabajadorService.getTrabajadorById(id),
          documentos: this.documentoService.getDocsByTrabajador(id)
        });
      })
    ).subscribe(result => { // 3. CORRECCIÓN: Se añade un tipo explícito al resultado
      if (result.trabajador) {
        this.trabajador = result.trabajador;
        this.documentos = result.documentos;
        this.groupDocumentsBySection();
        this.cd.detectChanges();
        this.createDocsChart();
      }
    });
  }

  groupDocumentsBySection(): void {
    this.documentosPorSeccion = this.documentos.reduce((acc, doc) => {
      (acc[doc.seccion] = acc[doc.seccion] || []).push(doc);
      return acc;
    }, {} as { [seccion: string]: Documentos[] });
  }

  createDocsChart(): void {
    if (isPlatformBrowser(this.platformId) && this.docsChartCanvas) {
      if (this.chartInstance) this.chartInstance.destroy();

      const context = this.docsChartCanvas.nativeElement.getContext('2d');
      if (context) {
        const totalRequeridos = 10;
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
    this.selectedFile = element.files ? element.files[0] : null;
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
        this.successMsg = '¡Documento subido!';
        this.uploadForm.reset();
        this.selectedFile = null;
        this.ngOnInit();
      },
      error: (err) => {
        this.errorMsg = 'Error al subir el documento.';
        this.cd.detectChanges();
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
