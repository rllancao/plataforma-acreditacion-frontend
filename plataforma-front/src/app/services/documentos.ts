import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Documentos {
  id: number;
  nombre: string;
  seccion: string;
  path: string;
  mimetype: string;
  status: 'Completado' | 'Pendiente' | 'Rechazado';
  observacion: string | null;
  fechaVencimiento: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private readonly apiUrl = 'http://localhost:8000/documentos';
  private platformId = inject(PLATFORM_ID); // Inyectar PLATFORM_ID

  constructor(private http: HttpClient) { }

  // Obtiene todos los documentos de un trabajador específico
  getDocsByTrabajador(trabajadorId: number): Observable<Documentos[]> {
    // ✅ CORRECCIÓN: Solo hacer la llamada HTTP si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Documentos[]>(`${this.apiUrl}/trabajador/${trabajadorId}`);
    }
    // En el servidor, devolver un arreglo vacío para evitar el error 401
    return of([]);
  }

  // Sube un nuevo documento
  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }



  // Descarga todos los documentos de un trabajador como un archivo .zip
  downloadAllAsZip(trabajadorId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/zip/${trabajadorId}`, {
      responseType: 'blob'
    });
  }

  // Obtiene un archivo como un Blob para visualizarlo
  viewDocument(docId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/view/${docId}`, {
      responseType: 'blob'
    });
  }

  updateDocument(docId: number, payload: { status?: string; observacion?: string; fechaVencimiento?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${docId}`, payload);
  }

  // Llama al endpoint para eliminar un documento
  deleteDocument(docId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${docId}`);
  }
}
