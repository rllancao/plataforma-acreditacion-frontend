import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; // 1. Importar forkJoin
import { UsuarioService, Empresa } from '../services/usuario';
import { FaenaService, Faena } from '../services/faena';
import { AdminService } from '../services/admin';
import { VolverAtras } from '../volver-atras/volver-atras';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VolverAtras],
  templateUrl: './admin-panel.html',
})
export class AdminPanelComponent implements OnInit {
  createUserForm: FormGroup;
  empresas: Empresa[] = [];
  faenas: Faena[] = [];

  feedbackMsg = '';
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private faenaService: FaenaService,
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {
    this.createUserForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['empresa', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // ✅ 2. CORRECCIÓN: Se usa forkJoin para esperar a que ambas llamadas a la API terminen
    forkJoin({
      empresas: this.usuarioService.getEmpresas(),
      faenas: this.faenaService.getFaenas()
    }).subscribe(({ empresas, faenas }) => {
      this.empresas = empresas;
      this.faenas = faenas;
      // 3. Se notifica a Angular que actualice la vista una vez que todos los datos están listos
      this.cd.detectChanges();
    });
  }

  onCreateUserSubmit(): void {
    if (this.createUserForm.invalid) return;
    this.clearMessages();

    this.adminService.createUser(this.createUserForm.value).subscribe({
      next: () => {
        this.feedbackMsg = '¡Usuario creado exitosamente!';
        this.createUserForm.reset({ role: 'empresa' });
        this.loadData();
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (err) => this.handleError(err),
    });
  }

  onDeleteEmpresa(empresaId: number, empresaNombre: string): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la empresa "${empresaNombre}"? Esta acción es irreversible.`)) {
      this.clearMessages();
      this.adminService.deleteEmpresa(empresaId).subscribe({
        next: (res) => {
          this.feedbackMsg = res.message;
          this.empresas = this.empresas.filter(e => e.id !== empresaId);
          this.cd.detectChanges();
          setTimeout(() => this.clearMessages(), 5000);
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  onDeleteFaena(faenaId: number, faenaNombre: string): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la faena "${faenaNombre}"? Esta acción es irreversible.`)) {
      this.clearMessages();
      this.adminService.deleteFaena(faenaId).subscribe({
        next: (res) => {
          this.feedbackMsg = res.message;
          this.faenas = this.faenas.filter(f => f.id !== faenaId);
          this.cd.detectChanges();
          setTimeout(() => this.clearMessages(), 5000);
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleError(err: any): void {
    this.errorMsg = err.error?.message || 'Ocurrió un error inesperado.';
    this.cd.detectChanges();
  }

  private clearMessages(): void {
    this.feedbackMsg = '';
    this.errorMsg = '';
  }
}
