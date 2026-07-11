import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './Auth.controller';
import { AuthService } from './Auth.service';
import { AuthRepository } from './Auth.repository';
import { TypeOrmAuthRepository } from './Auth.typeorm.repository';
import { USE_DATABASE } from '../database/use-database';
import { AuthUserEntity } from '../database/entities/auth-user.entity';

@Module({
  imports: USE_DATABASE ? [TypeOrmModule.forFeature([AuthUserEntity])] : [],
  controllers: [AuthController],
  providers: [
    AuthService,
    USE_DATABASE
      ? { provide: AuthRepository, useClass: TypeOrmAuthRepository }
      : AuthRepository,
  ],
})
export class AuthModule {}
