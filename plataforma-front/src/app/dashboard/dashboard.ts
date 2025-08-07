import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { LucideAngularModule, ChevronDown, Search, XCircle, Eye, X } from 'lucide-angular'; // 1. Importar nuevos iconos
import { Faena, FaenaService } from '../services/faena';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Documentos } from '../services/documentos';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Iconos
  ChevronDown = ChevronDown;
  Search = Search;
  XCircle = XCircle;
  Eye = Eye; // Icono para el botón "Ver"
  X = X;     // Icono para cerrar el popup

  selectedFaena?: Faena;
  workers: any[] = [];
  filteredWorkers: any[] = [];
  cargos: string[] = [];

  // ✅ Lógica para el Popup (Modal)
  isModalOpen = false;
  workerForModal: any | null = null;

  filterForm: FormGroup;

  private chartInstance?: Chart;
  private routeSub?: Subscription;
  private filterSub?: Subscription;
  private platformId = inject(PLATFORM_ID);

  @ViewChild('donutChart') donutChart!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private faenaService: FaenaService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.filterForm = new FormGroup({
      cargo: new FormControl(''),
      rut: new FormControl(''),
      nombre: new FormControl(''),
      estado: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const faenaId = Number(params.get('id'));
      if (faenaId) {
        this.faenaService.getFaenaById(faenaId).subscribe({
          next: (faena) => {
            this.selectedFaena = faena;
            this.workers = faena.trabajadores;
            this.filteredWorkers = [...this.workers];
            this.cargos = [...new Set(this.workers.map(w => w.cargo))];
            this.cd.detectChanges();
            this.updateChart();
          },
          error: (err) => {
            console.error('Acceso no autorizado o faena no encontrada:', err);
            this.router.navigate(['/select-faena']);
          }
        });
      }
    });

    this.filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const { cargo, rut, nombre, estado } = this.filterForm.value;
    let tempWorkers = [...this.workers];

    if (cargo) {
      tempWorkers = tempWorkers.filter(w => w.cargo === cargo);
    }
    if (rut) {
      tempWorkers = tempWorkers.filter(w => w.rut_pasaporte.toLowerCase().includes(rut.toLowerCase()));
    }
    if (nombre) {
      tempWorkers = tempWorkers.filter(w => w.nombre.toLowerCase().includes(nombre.toLowerCase()));
    }
    if (estado) {
      tempWorkers = tempWorkers.filter(w => w.status === estado);
    }

    this.filteredWorkers = tempWorkers;
    this.updateChart();
    this.cd.detectChanges();
  }

  resetFilters(): void {
    this.filterForm.reset({ cargo: '', rut: '', nombre: '', estado: '' });
  }

  // ✅ Métodos para manejar el Popup
  openWarningModal(worker: any): void {
    this.workerForModal = worker;
    this.isModalOpen = true;
  }

  closeWarningModal(): void {
    this.isModalOpen = false;
    this.workerForModal = null;
  }

  updateChart(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      if (!this.donutChart?.nativeElement) return;

      const context = this.donutChart.nativeElement.getContext('2d');
      if (context) {
        const aprobados = this.filteredWorkers.filter(w => w.status === 'Aprobado').length;
        const pendientes = this.filteredWorkers.filter(w => w.status === 'Pendiente').length;
        const rechazados = this.filteredWorkers.filter(w => w.status === 'Rechazado').length;
        const total = aprobados + pendientes + rechazados;

        const centerTextPlugin = {
          id: 'centerText',
          afterDraw: (chart: Chart) => {
            const ctx = chart.ctx;
            const { width, height } = chart;
            const percentage = total > 0 ? ((aprobados / total) * 100).toFixed(0) + '%' : '0%';
            ctx.save();
            ctx.font = 'bold 24px Arial ';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgb(74, 222, 128)';
            const centerX = width / 2;
            const centerY = height / 2;
            ctx.fillText(percentage, centerX, centerY);
            ctx.restore();
          }
        };

        const chartConfig: ChartConfiguration<'doughnut'> = {
          type: 'doughnut',
          data: {
            labels: ['Aprobados', 'Pendientes', 'Rechazados'],
            datasets: [{
              data: [aprobados, pendientes, rechazados],
              backgroundColor: ['rgb(74, 222, 128)', 'rgb(250, 204, 21)', 'rgb(248, 113, 113)'],
              hoverOffset: 4,
              borderColor: '#fff',
              borderWidth: 2,

            }],
          },
          plugins: [centerTextPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
              legend: {
                position: 'top',
                align: 'center',
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: {
                    size: 12
                  },
                  filter: () => true,
                }
              },
              title: {
                display: true,
                text: 'Estado de Postulantes',
              }
            }
          }
        };

        this.chartInstance = new Chart(context, chartConfig);
      }
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.filterSub?.unsubscribe();
    this.chartInstance?.destroy();
  }
}
