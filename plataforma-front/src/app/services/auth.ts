// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod'; // 1. Importar environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 2. Usar la variable apiUrl de environment
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    // El resto del código no necesita ningún cambio
    const loginUrl = `${this.apiUrl}/auth/login`;

    return this.http.post<any>(loginUrl, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}
