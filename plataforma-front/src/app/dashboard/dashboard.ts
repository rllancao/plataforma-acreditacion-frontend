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

// Definimos una interfaz para la estructura de datos de los nuevos gráficos
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
  // Iconos
  ChevronDown = ChevronDown;
  Search = Search;
  XCircle = XCircle;
  Eye = Eye;
  X = X;
  Wrench = Wrench

  selectedFaena?: Faena;
  workers: any[] = [];
  filteredWorkers: any[] = [];
  cargos: string[] = [];

  // ✅ NUEVA PROPIEDAD: Almacenará los datos procesados para los gráficos de cargos
  cargoStats: CargoStats[] = [];

  isModalOpen = false;
  workerForModal: any | null = null;

  filterForm: FormGroup;

  private mainChartInstance?: Chart;
  // ✅ NUEVA PROPIEDAD: Almacenará las instancias de los gráficos de cargos para poder destruirlos
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

            // ✅ CORRECCIÓN: Se extrae el 'nombre' del objeto cargo para los filtros.
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

  // ✅ NUEVO MÉTODO: Procesa los datos de la faena para generar las estadísticas de cada cargo
  processCargoData(): void {
    if (!this.selectedFaena || !this.selectedFaena.cargos) {
      this.cargoStats = [];
      return;
    }

    this.cargoStats = this.selectedFaena.cargos
      .map(cargo => {
        // 1. Filtramos los trabajadores que pertenecen a ESTA tanda específica.
        const trabajadoresAsignadosAlCargo = this.workers.filter(
          worker => worker.cargo?.id === cargo.id
        );

        // 2. Contamos los aprobados de ese grupo específico.
        const aprobados = trabajadoresAsignadosAlCargo.filter(
          worker => worker.status === 'Aprobado'
        ).length;

        // 3. El total de vacantes es la suma de los ya asignados + los que quedan.
        const vacantesTotales = trabajadoresAsignadosAlCargo.length + cargo.vacantes;

        // No mostramos el gráfico si no hay vacantes totales para esta tanda.
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

  // ✅ NUEVO MÉTODO: Crea los gráficos para cada cargo
  createCargoCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Usamos setTimeout para asegurar que el DOM se haya actualizado con los nuevos <canvas>
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
              // Texto a mostrar: "Aprobados / Total"
              const text = `${stat.aprobados} / ${stat.vacantesTotales}`;
              ctx.save();
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#4A5568'; // Color de texto gris oscuro
              const centerX = width / 2;
              const centerY = height / 2;
              ctx.fillText(text, centerX, centerY);
              ctx.restore();
            }
          };

          const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Ocupadas', 'Disponibles'],
              datasets: [{
                data: [stat.aprobados, stat.vacantesTotales - stat.aprobados],
                backgroundColor: ['rgb(74, 222, 128)', 'rgb(229, 231, 235)'], // Verde y Gris claro
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
                legend: { display: false }, // Ocultamos la leyenda para ahorrar espacio
                tooltip: { enabled: true },
              }
            }
          });
          this.cargoChartInstances.push(chart); // Guardamos la instancia para destruirla después
        }
      });
    }, 0);
  }

  applyFilters(): void {
    const { cargo, rut, nombre, estado } = this.filterForm.value;
    let tempWorkers = [...this.workers];

    if (cargo) {
      // ✅ CORRECCIÓN: Se filtra por el nombre dentro del objeto cargo.
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

  // Se renombra el método para mayor claridad
  updateMainChart(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.mainChartInstance) {
        this.mainChartInstance.destroy();
      }
      if (!this.donutChart?.nativeElement) return;

      const context = this.donutChart.nativeElement.getContext('2d');
      if (context) {
        // Los conteos de estados se basan en la lista de trabajadores FILTRADOS
        const aprobados = this.filteredWorkers.filter(w => w.status === 'Aprobado').length;
        const pendientes = this.filteredWorkers.filter(w => w.status === 'Pendiente').length;
        const rechazados = this.filteredWorkers.filter(w => w.status === 'Rechazado').length;

        // --- INICIO DE LA NUEVA LÓGICA ---
        // 1. Calculamos el total de posiciones de la faena
        const totalVacantes = this.cargoStats.reduce((sum, stat) => sum + stat.vacantesTotales, 0);

        // 2. Calculamos las vacantes que aún no tienen a nadie asignado
        const totalTrabajadoresActuales = this.workers.length; // Usamos el total de trabajadores sin filtrar
        const vacantesLibres = Math.max(0, totalVacantes - totalTrabajadoresActuales);
        // --- FIN DE LA NUEVA LÓGICA ---

        const centerTextPlugin = {
          id: 'centerText',
          afterDraw: (chart: Chart) => {
            const ctx = chart.ctx;
            const { width, height } = chart;

            // 3. El porcentaje ahora refleja el progreso real hacia el objetivo total de contratación
            const percentage = totalVacantes > 0 ? ((aprobados / totalVacantes) * 100).toFixed(0) + '%' : '0%';

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
            // 4. Añadimos "Vacantes" a las etiquetas
            labels: ['Aprobados', 'Pendientes', 'Rechazados', 'Vacantes'],
            datasets: [{
              // 5. Añadimos el recuento de vacantes libres a los datos
              data: [aprobados, pendientes, rechazados, vacantesLibres],
              // 6. Añadimos un color para el nuevo segmento
              backgroundColor: [
                'rgb(74, 222, 128)',  // Aprobados (Verde)
                'rgb(250, 204, 21)',   // Pendientes (Amarillo)
                'rgb(248, 113, 113)',  // Rechazados (Rojo)
                'rgb(229, 231, 235)'   // Vacantes (Gris Claro)
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
    // Destruimos el gráfico principal
    this.mainChartInstance?.destroy();
    // ✅ DESTRUIMOS TODOS LOS GRÁFICOS DE CARGOS
    this.cargoChartInstances.forEach(chart => chart.destroy());
  }
}

