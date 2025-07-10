import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment.prod';

// --- Interfaces para un tipado fuerte y claro ---

// Interfaz para el objeto Usuario anidado
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

// Interfaz para el objeto Faena anidado
interface FaenaRelacion {
  id: number;
  nombre: string;
  ciudad: string;
  usuario: Usuario; // La faena tiene un usuario anidado
}

// Interfaz principal para el Trabajador
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
  // ✅ CORRECCIÓN: Se añade la propiedad para la relación con Faena
  faenaRelacion: FaenaRelacion;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // GET /trabajadores/:id
  getTrabajadorById(id: number): Observable<Trabajador> {
    // Le decimos a HttpClient que la respuesta tendrá la forma de nuestra interfaz Trabajador
    return this.http.get<Trabajador>(`${this.apiUrl}/${id}`);
  }
}
