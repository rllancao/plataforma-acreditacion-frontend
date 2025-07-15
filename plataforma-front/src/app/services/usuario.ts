import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para el objeto Empresa simplificado
export interface Empresa {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = 'http://localhost:8000/usuario';

  constructor(private http: HttpClient) { }

  // Obtiene la lista de todas las empresas para el selector
  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`);
  }
}
