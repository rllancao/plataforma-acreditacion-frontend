import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProd } from '../../environments/environment.prod';

export interface DocumentoRequisito {
  id: number;
  nombre: string;
  opciones: string[] | null;
}
export interface SeccionRequisito {
  id: number;
  nombre: string;
  documentos: DocumentoRequisito[];
}

@Injectable({ providedIn: 'root' })
export class RequisitosService {
  private readonly apiUrl = `${environmentProd.apiUrl}/requisitos`;
  constructor(private http: HttpClient) {}

  getRequisitos(): Observable<SeccionRequisito[]> {
    return this.http.get<SeccionRequisito[]>(this.apiUrl);
  }
}
