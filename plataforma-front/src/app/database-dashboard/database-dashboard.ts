import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { LucideAngularModule, ChevronDown, Search, XCircle, Eye, X } from 'lucide-angular';
// ✅ Se importa la interfaz 'Cargo'
import { Trabajador, TrabajadorService, Cargo } from '../services/trabajador';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-database-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule, VolverAtras],
  templateUrl: './database-dashboard.html',
})
export class DatabaseDashboardComponent implements OnInit, OnDestroy {
  // Iconos
  ChevronDown = ChevronDown;
  Search = Search;
  XCircle = XCircle;
  Eye = Eye;
  X = X;

  allWorkers: Trabajador[] = [];
  filteredWorkers: Trabajador[] = [];

  // ✅ CORRECCIÓN: La propiedad ahora es de tipo 'Cargo[]'
  cargosDisponibles: Cargo[] = [];

  empresas: string[] = [];
  faenasDisponibles: string[] = [];

  isModalOpen = false;
  workerForModal: any | null = null;

  filterForm: FormGroup;

  private chartInstance?: Chart;
  private subscriptions: Subscription = new Subscription();
  private platformId = inject(PLATFORM_ID);

  @ViewChild('donutChart') donutChart!: ElementRef<HTMLCanvasElement>;

  constructor(
    private trabajadorService: TrabajadorService,
    private cd: ChangeDetectorRef
  ) {
    this.filterForm = new FormGroup({
      cargo: new FormControl(''),
      rut: new FormControl(''),
      nombre: new FormControl(''),
      estado: new FormControl(''),
      empresa: new FormControl(''),
      faena: new FormControl(''),
    });
  }

  ngOnInit(): void {
    const dataSub = this.trabajadorService.getAllTrabajadores().subscribe({
      next: (workers) => {
        this.allWorkers = workers;
        this.filteredWorkers = [...this.allWorkers];

        this.empresas = [...new Set(this.allWorkers.map(w => w.faenaRelacion.usuario.nombre))].sort();
        this.updateFaenaAndCargoLists();

        this.cd.detectChanges();
        this.updateChart();
      },
      error: (err) => {
        console.error('Error al cargar todos los trabajadores:', err);
      }
    });
    this.subscriptions.add(dataSub);

    const empresaChangesSub = this.filterForm.get('empresa')?.valueChanges.subscribe(() => {
      this.filterForm.get('faena')?.setValue('', { emitEvent: false });
      this.filterForm.get('cargo')?.setValue('', { emitEvent: false });
      this.updateFaenaAndCargoLists();
    });
    this.subscriptions.add(empresaChangesSub);

    const faenaChangesSub = this.filterForm.get('faena')?.valueChanges.subscribe(() => {
      this.filterForm.get('cargo')?.setValue('', { emitEvent: false });
      this.updateFaenaAndCargoLists();
    });
    this.subscriptions.add(faenaChangesSub);

    const allFiltersSub = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
    this.subscriptions.add(allFiltersSub);
  }

  // ✅ CORRECCIÓN: Método actualizado para manejar objetos 'Cargo'
  updateFaenaAndCargoLists(): void {
    const selectedEmpresa = this.filterForm.get('empresa')?.value;
    const selectedFaena = this.filterForm.get('faena')?.value;

    let workersForDropdowns = this.allWorkers;

    if (selectedEmpresa) {
      workersForDropdowns = workersForDropdowns.filter(w => w.faenaRelacion.usuario.nombre === selectedEmpresa);
    }
    this.faenasDisponibles = [...new Set(workersForDropdowns.map(w => w.faenaRelacion.nombre))].sort();

    if (selectedFaena) {
      workersForDropdowns = workersForDropdowns.filter(w => w.faenaRelacion.nombre === selectedFaena);
    }

    // Se utiliza un Map para obtener cargos únicos basados en su ID
    const cargoMap = new Map<number, Cargo>();
    workersForDropdowns.forEach(worker => {
      if (worker.cargo) {
        cargoMap.set(worker.cargo.id, worker.cargo);
      }
    });
    this.cargosDisponibles = Array.from(cargoMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  applyFilters(): void {
    const { cargo, rut, nombre, estado, empresa, faena } = this.filterForm.value;
    let tempWorkers = [...this.allWorkers];

    if (empresa) {
      tempWorkers = tempWorkers.filter(w => w.faenaRelacion.usuario.nombre === empresa);
    }
    if (faena) {
      tempWorkers = tempWorkers.filter(w => w.faenaRelacion.nombre === faena);
    }
    // ✅ CORRECCIÓN: Se filtra por el ID del cargo
    if (cargo) {
      tempWorkers = tempWorkers.filter(w => w.cargo?.id === Number(cargo));
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
    this.filterForm.reset({ cargo: '', rut: '', nombre: '', estado: '', empresa: '', faena: '' });
  }

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
        const total = this.filteredWorkers.length;

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
    this.subscriptions.unsubscribe();
    this.chartInstance?.destroy();
  }
}

