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

  // Promise-returning (convención de los adapters in-memory) para que la
  // firma coincida con TypeOrmAuthRepository y AuthService pueda hacer await.
  findByRut(rut: string): Promise<AuthUser | undefined> {
    return Promise.resolve(this.users.find((u) => u.rut === rut));
  }
}
