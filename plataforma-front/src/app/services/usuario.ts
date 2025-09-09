import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaz para el objeto Empresa simplificado
export interface Empresa {
  id: number;
  nombre: string;
}
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) { }

  // Obtiene la lista de todas las empresas para el selector
  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`);
  }

  createEmpresa(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresa`, payload);
  }

  createEmpleado(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleado`, payload);
  }
}
