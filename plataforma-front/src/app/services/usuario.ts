import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProd } from '../../environments/environment.prod';

// Interfaz para el objeto Empresa simplificado
export interface Empresa {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environmentProd.apiUrl}/usuario`;

  constructor(private http: HttpClient) { }

  // Obtiene la lista de todas las empresas para el selector
  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`);
  }

  createEmpresa(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresa`, payload);
  }
}
