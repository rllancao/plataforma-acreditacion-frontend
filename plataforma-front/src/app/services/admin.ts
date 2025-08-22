import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from './usuario'; // Asumiendo que tienes una interfaz de Usuario

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  createUser(payload: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/create-user`, payload);
  }

  deleteEmpresa(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/empresa/${id}`);
  }

  deleteFaena(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/faena/${id}`);
  }
}
