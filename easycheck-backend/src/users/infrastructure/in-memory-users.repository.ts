import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UsersRepositoryPort } from '../application/user-registration.ports';

@Injectable()
export class InMemoryUsersRepository implements UsersRepositoryPort {
  private users = new Map<string, User>();

  async existsByRut(rut: string): Promise<boolean> {
    return this.users.has(rut);
  }

  async save(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const created: User = {
      id: `usr-${this.users.size + 1}`,
      ...user,
      createdAt: new Date(),
    };
    this.users.set(created.rut, created);
    return created;
  }

  async findByRut(rut: string): Promise<User | null> {
    return this.users.get(rut) ?? null;
  }

  reset(): void {
    this.users.clear();
  }
}
