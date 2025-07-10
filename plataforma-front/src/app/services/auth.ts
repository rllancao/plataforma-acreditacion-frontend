// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs'; // Asegúrate de importar todo

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    const loginUrl = `${this.apiUrl}/auth/login`;

    return this.http.post<any>(loginUrl, credentials).pipe(
      // Este 'tap' solo se ejecuta si el login es exitoso
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
      }),
      // ✅ ESTE BLOQUE ES CRUCIAL
      catchError(error => {
        // Atrapamos el error de la API (ej: 401 Unauthorized)
        // Y lo relanzamos para que el componente que se suscribió lo reciba.
        return throwError(() => error);
      })
    );
  }
}
