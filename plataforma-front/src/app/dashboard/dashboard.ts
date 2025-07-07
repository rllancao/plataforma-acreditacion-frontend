import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule, ChevronDown, Search, XCircle } from 'lucide-angular';
import { Faena, FaenaService } from '../services/faena';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  selectedFaena?: Faena;
  workers: any[] = [];
  filteredWorkers: any[] = [];
  cargos: string[] = [];

  filterForm: FormGroup;

  private chartInstance?: Chart;
  private routeSub?: Subscription;
  private filterSub?: Subscription;
  private platformId = inject(PLATFORM_ID); // 1. Inyectar PLATFORM_ID

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
          // ✅ 3. Añadir el bloque de error para manejar el 404
          error: (err) => {
            console.error('Acceso no autorizado o faena no encontrada:', err);
            // Redirige al usuario a la página de selección si no tiene acceso
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

  updateChart(): void {
    // ✅ 2. CORRECCIÓN: Solo ejecutar la lógica del gráfico si estamos en el navegador
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

        this.chartInstance = new Chart(context, {
          type: 'doughnut',
          data: {
            labels: ['Aprobados', 'Pendientes', 'Rechazados'],
            datasets: [{
              data: [aprobados, pendientes, rechazados],
              backgroundColor: ['rgb(74, 222, 128)', 'rgb(250, 204, 21)', 'rgb(248, 113, 113)'],
              hoverOffset: 4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Estado de Postulantes' } }
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.filterSub?.unsubscribe();
    this.chartInstance?.destroy();
  }
}
