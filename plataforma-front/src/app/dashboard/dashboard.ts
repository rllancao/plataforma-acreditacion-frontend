import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { LucideAngularModule, ChevronDown, Search, XCircle, Eye, X, Wrench } from 'lucide-angular';
import { Faena, FaenaService } from '../services/faena';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { Documentos } from '../services/documentos';

Chart.register(...registerables);

interface CargoStats {
  nombre: string;
  tanda: number;
  vacantesTotales: number;
  aprobados: number;
  chartId: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  ChevronDown = ChevronDown;
  Search = Search;
  XCircle = XCircle;
  Eye = Eye;
  X = X;
  Wrench = Wrench;

  selectedFaena?: Faena;
  workers: any[] = [];
  filteredWorkers: any[] = [];
  cargos: string[] = [];
  cargoStats: CargoStats[] = [];

  isModalOpen = false;
  workerForModal: any | null = null;

  filterForm: FormGroup;

  private mainChartInstance?: Chart;
  private cargoChartInstances: Chart[] = [];
  private routeSub?: Subscription;
  private filterSub?: Subscription;
  private platformId = inject(PLATFORM_ID);

  @ViewChild('donutChart') donutChart!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private faenaService: FaenaService,
    private router: Router,
    private cd: ChangeDetectorRef,
    public authService: AuthService
  ) {
    this.filterForm = new FormGroup({
      cargo: new FormControl(''),
      rut: new FormControl(''),
      nombre: new FormControl(''),
      estado: new FormControl(''),
    });
  }

  get userRole(): 'admin' | 'empresa' | 'empleado' | 'superAdmin' | null {
    return this.authService.getUserRole();
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
            this.cargos = [...new Set(this.workers.map(w => w.cargo?.nombre).filter(Boolean))];

            this.processCargoData();
            this.updateMainChart();
            this.createCargoCharts();

            this.cd.detectChanges();
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

  processCargoData(): void {
    if (!this.selectedFaena || !this.selectedFaena.cargos) {
      this.cargoStats = [];
      return;
    }

    this.cargoStats = this.selectedFaena.cargos
      .map(cargo => {
        const trabajadoresAsignadosAlCargo = this.workers.filter(
          worker => worker.cargo?.id === cargo.id
        );

        const aprobados = trabajadoresAsignadosAlCargo.filter(
          worker => worker.status === 'Aprobado'
        ).length;

        const vacantesTotales = trabajadoresAsignadosAlCargo.length + cargo.vacantes;

        if (vacantesTotales === 0) return null;

        return {
          nombre: cargo.nombre,
          tanda: cargo.tanda,
          vacantesTotales: vacantesTotales,
          aprobados: aprobados,
          chartId: `cargo-chart-${cargo.id}`
        };
      })
      .filter((stat): stat is CargoStats => stat !== null);
  }

  createCargoCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.cargoChartInstances.forEach(chart => chart.destroy());
    this.cargoChartInstances = [];

    setTimeout(() => {
      this.cargoStats.forEach(stat => {
        const canvas = document.getElementById(stat.chartId) as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');

        if (ctx) {
          const centerTextVacantesPlugin = {
            id: 'centerTextVacantes',
            afterDraw: (chart: Chart) => {
              const ctx = chart.ctx;
              const { width, height } = chart;
              const text = `${stat.aprobados} / ${stat.vacantesTotales}`;
              ctx.save();
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#4A5568';
              const centerX = width / 2;
              const centerY = height / 2;
              ctx.fillText(text, centerX, centerY);
              ctx.restore();
            }
          };

          const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Aprobados', 'Disponibles'],
              datasets: [{
                data: [stat.aprobados, stat.vacantesTotales - stat.aprobados],
                backgroundColor: ['rgb(74, 222, 128)', 'rgb(229, 231, 235)'],
                hoverOffset: 4,
                borderColor: '#fff',
                borderWidth: 2,
              }]
            },
            plugins: [centerTextVacantesPlugin],
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              }
            }
          });
          this.cargoChartInstances.push(chart);
        }
      });
    }, 0);
  }

  applyFilters(): void {
    const { cargo, rut, nombre, estado } = this.filterForm.value;
    let tempWorkers = [...this.workers];

    if (cargo) {
      tempWorkers = tempWorkers.filter(w => w.cargo?.nombre === cargo);
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
    this.updateMainChart();
    this.cd.detectChanges();
  }

  resetFilters(): void {
    this.filterForm.reset({ cargo: '', rut: '', nombre: '', estado: '' });
  }

  openWarningModal(worker: any): void {
    this.workerForModal = worker;
    this.isModalOpen = true;
  }

  closeWarningModal(): void {
    this.isModalOpen = false;
    this.workerForModal = null;
  }

  updateMainChart(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.mainChartInstance) {
        this.mainChartInstance.destroy();
      }
      if (!this.donutChart?.nativeElement) return;

      const context = this.donutChart.nativeElement.getContext('2d');
      if (context) {
        const aprobados = this.filteredWorkers.filter(w => w.status === 'Aprobado').length;
        const pendientes = this.filteredWorkers.filter(w => w.status === 'Pendiente').length;
        const rechazados = this.filteredWorkers.filter(w => w.status === 'Rechazado').length;

        const totalVacantes = this.cargoStats.reduce((sum, stat) => sum + stat.vacantesTotales, 0);
        const totalTrabajadoresActuales = this.workers.length;
        const vacantesLibres = Math.max(0, totalVacantes - totalTrabajadoresActuales);

        const centerTextPlugin = {
          id: 'centerText',
          afterDraw: (chart: Chart) => {
            const ctx = chart.ctx;
            const { width, height } = chart;
            const percentage = totalVacantes > 0 ? ((aprobados / totalVacantes) * 100).toFixed(0) + '%' : '0%';

            // ✅ CORRECCIÓN DE CENTRADO PRECISO
            ctx.save();
            const fontSize = 24;
            const fontStyle = `bold ${fontSize}px Arial`;
            ctx.font = fontStyle;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgb(74, 222, 128)';
            const centerX = width / 1.97;
            const centerY = height / 1.7;

            // Medimos la altura real del texto para un centrado perfecto
            const textMetrics = ctx.measureText(percentage);
            const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

            // Se dibuja el texto en el centro exacto del canvas
            ctx.fillText(percentage, centerX, centerY + (textHeight / 4));

            ctx.restore();
          }
        };

        const chartConfig: ChartConfiguration<'doughnut'> = {
          type: 'doughnut',
          data: {
            labels: ['Aprobados', 'Pendientes', 'Rechazados', 'Vacantes'],
            datasets: [{
              data: [aprobados, pendientes, rechazados, vacantesLibres],
              backgroundColor: [
                'rgb(74, 222, 128)',
                'rgb(250, 204, 21)',
                'rgb(248, 113, 113)',
                'rgb(229, 231, 235)'
              ],
              hoverOffset: 4,
              borderColor: '#fff',
              borderWidth: 2,
            }],
          },
          plugins: [centerTextPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
                text: 'Progreso General de Contratación',
              }
            }
          }
        };
        this.mainChartInstance = new Chart(context, chartConfig);
      }
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.filterSub?.unsubscribe();
    this.mainChartInstance?.destroy();
    this.cargoChartInstances.forEach(chart => chart.destroy());
  }
}

