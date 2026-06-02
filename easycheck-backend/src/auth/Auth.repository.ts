import { Injectable } from '@nestjs/common';

export type UserRole = 'estudiante' | 'profesor';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface AuthUser {
  rut: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * Capa de datos de autenticación. In-memory (igual que DataRepository).
 * Expone seedUser/reset para que los tests BDD preparen fixtures.
 */
@Injectable()
export class AuthRepository {
  private users: AuthUser[] = [];

  reset(): void {
    this.users = [];
  }

  seedUser(rut: string, role: UserRole, status: UserStatus): void {
    this.users.push({ rut, role, status });
  }

  findByRut(rut: string): AuthUser | undefined {
    return this.users.find((u) => u.rut === rut);
  }
}
