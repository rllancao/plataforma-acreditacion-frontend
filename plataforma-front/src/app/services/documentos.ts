import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/documentos`;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

  getDocsByTrabajador(trabajadorId: number): Observable<Documentos[]> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Documentos[]>(`${this.apiUrl}/trabajador/${trabajadorId}`);
    }
    return of([]);
  }

  marcarComoNoAplica(payload: { trabajadorId: number; nombre: string; seccion: string; }): Observable<Documentos> {
    return this.http.post<Documentos>(`${this.apiUrl}/no-aplica`, payload);
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  downloadAllAsZip(trabajadorId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/zip/${trabajadorId}`, {
      responseType: 'blob'
    });
  }

  // ✅ CORRECCIÓN: Se reemplaza el método viewDocument.
  // Este método ahora simplemente construye y devuelve la URL del endpoint.
  getViewDocumentUrl(docId: number): string {
    return `${this.apiUrl}/view/${docId}`;
  }

  updateDocument(docId: number, payload: { status?: string; observacion?: string; fechaVencimiento?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${docId}`, payload);
  }

  deleteDocument(docId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${docId}`);
  }
}
