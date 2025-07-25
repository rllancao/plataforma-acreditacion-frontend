import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Interfaz para el objeto Usuario anidado dentro de Faena
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

// Interfaz principal para Faena, ahora con la relación de usuario
export interface Faena {
  id: number;
  nombre: string;
  ciudad: string;
  trabajadores: any[];
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class FaenaService {
  private readonly apiUrl = 'http://localhost:8000/faenas';
  private platformId = inject(PLATFORM_ID); // Inyectar PLATFORM_ID

  constructor(private http: HttpClient) { }

  // GET /faenas
  getFaenas(): Observable<Faena[]> {
    // Solo hacer la llamada HTTP si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Faena[]>(this.apiUrl);
    }
    // En el servidor, devolver un arreglo vacío para evitar el error 401
    return of([]);
  }

  // GET /faenas/:id
  getFaenaById(id: number): Observable<Faena> {
    // Solo hacer la llamada HTTP si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Faena>(`${this.apiUrl}/${id}`);
    }
    // En el servidor, devolver un objeto "esqueleto" para que la plantilla no se rompa
    const skeletonFaena: Faena = {
      id: id,
      nombre: 'Cargando...',
      ciudad: '',
      trabajadores: [],
      usuario: { id: 0, nombre: '', email: '' }
    };
    return of(skeletonFaena);
  }
}
