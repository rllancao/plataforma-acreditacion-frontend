import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Contiene validadores personalizados para los formularios reactivos de Angular.
 */
export class CustomValidators {

  /**
   * Validador para asegurar que el campo contenga al menos un nombre y un apellido.
   * - Verifica que haya al menos dos palabras separadas por un espacio.
   * - Verifica que cada palabra tenga al menos 2 caracteres.
   */
  static nombreApellidoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) {
        return null; // No validar si está vacío, para eso está 'required'.
      }

      const parts = value.trim().split(' ').filter(p => p.length > 0);
      if (parts.length < 2) {
        return { 'nombreIncompleto': 'Debe ingresar al menos un nombre y un apellido.' };
      }

      const algunaParteCorta = parts.some(part => part.length < 2);
      if (algunaParteCorta) {
        return { 'nombreCorto': 'Cada nombre y apellido debe tener al menos 2 letras.' };
      }

      return null; // Pasa la validación
    };
  }

  /**
   * Validador para el formato de RUT chileno o Pasaporte.
   * - RUT: 7 u 8 dígitos, guion y un dígito o 'k'.
   * - Pasaporte: 6 a 12 caracteres alfanuméricos.
   */
  static rutPasaporteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) {
        return null;
      }

      const rutRegex = /^\d{7,8}-[\dkK]$/;
      const passportRegex = /^[A-Z0-9]{6,12}$/i;

      if (rutRegex.test(value) || passportRegex.test(value)) {
        return null; // Formato válido
      }

      return { 'formatoInvalido': 'El formato del RUT o Pasaporte es incorrecto.' };
    };
  }

  /**
   * Validador para asegurar que la fecha de nacimiento corresponda a una edad mínima.
   * @param minAge La edad mínima requerida (ej. 18).
   */
  static minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) {
        return null;
      }

      const birthDate = new Date(value);
      // Comprobación simple para evitar fechas futuras o inválidas
      if (birthDate > new Date()) {
        return { 'fechaFutura': 'La fecha de nacimiento no puede ser en el futuro.' };
      }

      const timeDiff = Math.abs(Date.now() - birthDate.getTime());
      const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);

      if (age < minAge) {
        return { 'edadMinima': `La edad mínima requerida es de ${minAge} años.` };
      }

      return null; // Pasa la validación
    };
  }
}
