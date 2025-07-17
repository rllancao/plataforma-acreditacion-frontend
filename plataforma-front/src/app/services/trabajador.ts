import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// --- Interfaces ---
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface DocumentoRequisito {
  id: number;
  nombre: string;
  seccion: { id: number; nombre: string; };
}

interface FaenaRelacion {
  id: number;
  nombre: string;
  ciudad: string;
  usuario: Usuario;
  documentosRequeridos: DocumentoRequisito[];
}

export interface Trabajador {
  id: number;
  nombre: string;
  rut_pasaporte: string;
  tipo_evaluacion: string;
  sede_evaluacion: string;
  fecha_atencion: string;
  fecha_informe: string;
  telefono: number;
  email: string;
  direccion: string;
  fecha_nacimiento: string;
  genero: string;
  edad: number;
  cargo: string;
  faenaRelacion: FaenaRelacion;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private readonly apiUrl = 'http://localhost:8000/trabajadores';
  private platformId = inject(PLATFORM_ID); // Inyectar PLATFORM_ID

  constructor(private http: HttpClient) { }

  getTrabajadorById(id: number): Observable<Trabajador | null> {
    // ✅ CORRECCIÓN: Solo hacer la llamada HTTP si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Trabajador>(`${this.apiUrl}/${id}`);
    }
    // En el servidor, devolver un observable de null para evitar el error
    return of(null);
  }

  createTrabajador(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  createTrabajadoresBulk(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, formData);
  }

  deleteTrabajadorByRut(rut: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/by-rut/${rut}`);
  }
}
