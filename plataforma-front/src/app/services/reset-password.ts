// src/app/services/reset-password.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
// Por convención, los nombres de clases usan PascalCase
export class ResetPassService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Actualiza la contraseña de un usuario específico.
   * @param email - El email del usuario para identificarlo en la URL.
   * @param newPassword - La nueva contraseña que se enviará en el cuerpo de la petición.
   */
  sendCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-code`, { email, code });
  }
  resetPassword(email: string, newPassword: string, token: string): Observable<any> {
    const resetPasswordUrl = `${this.apiUrl}/usuario/${email}`;
    const body = { password: newPassword };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('[ResetPassService] Enviando petición PUT con token temporal.');

    return this.http.put(resetPasswordUrl, body, { headers });
  }
}
