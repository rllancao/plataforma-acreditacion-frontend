import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Documentos {
  id: number;
  nombre: string;
  seccion: string;
  path: string;
  mimetype: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private readonly apiUrl = 'http://localhost:8000/documentos';

  constructor(private http: HttpClient) { }

  // Obtiene todos los documentos de un trabajador específico
  getDocsByTrabajador(trabajadorId: number): Observable<Documentos[]> {
    return this.http.get<Documentos[]>(`${this.apiUrl}/trabajador/${trabajadorId}`);
  }

  // Sube un nuevo documento
  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Descarga todos los documentos de un trabajador como un archivo .zip
  downloadAllAsZip(trabajadorId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/zip/${trabajadorId}`, {
      responseType: 'blob' // Es crucial para manejar la descarga de archivos
    });
  }
}
