import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

// Interfaz para el payload decodificado del token
interface DecodedToken {
  userId: number;
  email: string;
  role: 'admin' | 'empresa';
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000';
  private platformId = inject(PLATFORM_ID); // Inyectar PLATFORM_ID para detectar el entorno

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    const loginUrl = `${this.apiUrl}/auth/login`;
    return this.http.post<any>(loginUrl, credentials).pipe(
      tap(response => {
        // Solo acceder a localStorage si estamos en el navegador
        if (isPlatformBrowser(this.platformId) && response?.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
      })
    );
  }

  getUserRole(): 'admin' | 'empresa' | null {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: DecodedToken = jwtDecode(token);
          return decodedToken.role;
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          return null;
        }
      }
    }
    return null;
  }

  logout(): void {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
  }

  isAuthenticated(): boolean {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }
}
