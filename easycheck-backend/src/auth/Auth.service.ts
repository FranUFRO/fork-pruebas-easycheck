import { Injectable } from '@nestjs/common';
import { AuthRepository } from './Auth.repository';

export interface LoginDto {
  rut: string;
  password: string;
}

export interface LoginResult {
  role: string;
  redirectUrl: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(_dto: LoginDto): Promise<LoginResult> {
    throw new Error('AuthService.login no implementado');
  }
}
