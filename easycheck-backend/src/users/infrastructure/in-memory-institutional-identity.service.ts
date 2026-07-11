import { Injectable } from '@nestjs/common';
import { InstitutionalUser } from '../domain/user.entity';
import { UserRole } from '../domain/user-role.enum';
import {
  InstitutionalIdentityPort,
  ValidateInstitutionalUserParams,
} from '../application/user-registration.ports';

/**
 * Stub de la Intranet de la UFRO (la API real aun no existe). Mientras tanto,
 * se considera que un usuario pertenece a la Universidad de La Frontera si su
 * correo institucional termina en `@ufromail.cl` y la parte local contiene
 * exactamente 2 digitos (p. ej. `22@ufromail.cl`, `i.cicarelli03@ufromail.cl`).
 * Sin API real no se puede validar la contrasena institucional.
 */
@Injectable()
export class InMemoryInstitutionalIdentityService implements InstitutionalIdentityPort {
  private static readonly UFRO_DOMAIN = '@ufromail.cl';
  private static readonly REQUIRED_DIGITS = 2;

  validateInstitutionalUser(
    params: ValidateInstitutionalUserParams,
  ): Promise<InstitutionalUser | null> {
    if (!this.belongsToUfro(params.institutionalEmail)) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      rut: params.rut,
      institutionalEmail: params.institutionalEmail,
      // Sin API real no conocemos nombre ni rol institucionales; el servicio
      // usa los datos del formulario (command.fullName / command.role).
      fullName: '',
      role: UserRole.ESTUDIANTE,
    });
  }

  private belongsToUfro(email: string): boolean {
    const domain = InMemoryInstitutionalIdentityService.UFRO_DOMAIN;
    if (!email.endsWith(domain)) {
      return false;
    }

    const localPart = email.slice(0, -domain.length);
    const digitCount = (localPart.match(/\d/g) ?? []).length;
    return digitCount === InMemoryInstitutionalIdentityService.REQUIRED_DIGITS;
  }
}
