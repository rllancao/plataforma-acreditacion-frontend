import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environmentProd } from '../../environments/environment.prod';

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
  private readonly apiUrl = environmentProd.apiUrl;
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
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      // Devuelve true si la fecha de expiración es posterior a la fecha actual
      return expirationDate.valueOf() > new Date().valueOf();
    } catch (error) {
      console.error('Error al decodificar el token en isAuthenticated:', error);
      return false;
    }
  }
}
