// src/app/services/reset-password.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
// Por convención, los nombres de clases usan PascalCase
export class ResetPassService {
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  /**
   * Actualiza la contraseña de un usuario específico.
   * @param email - El email del usuario para identificarlo en la URL.
   * @param newPassword - La nueva contraseña que se enviará en el cuerpo de la petición.
   */
  resetPassword(email: string, newPassword: string): Observable<any> {
    // ✅ CORRECCIÓN: Construimos la URL correcta incluyendo el email del usuario.
    const resetPasswordUrl = `${this.apiUrl}/usuario/${email}`;

    // ✅ MEJORA: Enviamos solo la nueva contraseña en el cuerpo del PUT.
    const body = { password: newPassword };

    return this.http.put<any>(resetPasswordUrl, body).pipe(
      catchError(error => {
        console.error('Error al actualizar la contraseña:', error);
        // Relanzamos el error para que el componente pueda manejarlo.
        return throwError(() => error);
      })
    );
  }
}
