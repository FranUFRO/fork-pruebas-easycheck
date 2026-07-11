import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from './Auth.repository';
import { AuthUserEntity } from '../database/entities/auth-user.entity';

/**
 * Implementación Postgres/TypeORM de AuthRepository. Se registra bajo el
 * mismo token cuando `DB_HOST` está definido. `findByRut` es async aquí
 * (la versión in-memory es sync); AuthService hace `await`, que funciona
 * con ambas.
 */
@Injectable()
export class TypeOrmAuthRepository {
  constructor(
    @InjectRepository(AuthUserEntity)
    private readonly users: Repository<AuthUserEntity>,
  ) {}

  async findByRut(rut: string): Promise<AuthUser | undefined> {
    const user = await this.users.findOneBy({ rut });
    return user ? (user as AuthUser) : undefined;
  }
}
