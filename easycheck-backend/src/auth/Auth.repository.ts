import { Injectable } from '@nestjs/common';

export type UserRole = 'estudiante' | 'profesor';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface AuthUser {
  rut: string;
  role: UserRole;
  status: UserStatus;
}

// Almacén de usuarios en memoria (igual que DataRepository).
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
