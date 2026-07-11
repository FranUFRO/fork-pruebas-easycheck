import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterUserService } from './application/register-user.service';
import {
  INSTITUTIONAL_IDENTITY_PORT,
  USERS_REPOSITORY_PORT,
} from './application/user-registration.ports';
import { InMemoryInstitutionalIdentityService } from './infrastructure/in-memory-institutional-identity.service';
import { InMemoryUsersRepository } from './infrastructure/in-memory-users.repository';
import { TypeOrmUsersRepository } from './infrastructure/typeorm-users.repository';
import { UserTypeOrmEntity } from './infrastructure/user.typeorm.entity';
import { USE_DATABASE } from '../database/use-database';
import { UsersController } from './users.controller';

// Los providers in-memory se registran SIEMPRE (los tests BDD los obtienen
// por token de clase); solo el binding del puerto cambia según USE_DATABASE.
// El puerto de identidad institucional sigue in-memory en ambos modos: es el
// stub del Intranet UFRO (sistema externo), no una tabla propia.
@Module({
  imports: USE_DATABASE ? [TypeOrmModule.forFeature([UserTypeOrmEntity])] : [],
  controllers: [UsersController],
  providers: [
    RegisterUserService,
    InMemoryInstitutionalIdentityService,
    InMemoryUsersRepository,
    ...(USE_DATABASE ? [TypeOrmUsersRepository] : []),
    {
      provide: INSTITUTIONAL_IDENTITY_PORT,
      useExisting: InMemoryInstitutionalIdentityService,
    },
    USE_DATABASE
      ? { provide: USERS_REPOSITORY_PORT, useExisting: TypeOrmUsersRepository }
      : {
          provide: USERS_REPOSITORY_PORT,
          useExisting: InMemoryUsersRepository,
        },
  ],
  exports: [
    RegisterUserService,
    InMemoryInstitutionalIdentityService,
    InMemoryUsersRepository,
  ],
})
export class UsersModule {}
