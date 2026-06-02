import { Injectable } from '@nestjs/common';
import { AuthRepository } from './Auth.repository';
import {
  EmptyCredentialsException,
  InvalidRutFormatException,
  AccountDisabledException,
  InvalidCredentialsException,
} from '../common/exceptions';

export interface LoginDto {
  rut: string;
  password: string;
}

export interface LoginResult {
  role: string;
  redirectUrl: string;
}

// RUT con dígito verificador: 7-8 dígitos, guion y DV (dígito o K).
const RUT_PATTERN = /^\d{7,8}-[\dkK]$/;

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const rut = dto?.rut ?? '';
    const password = dto?.password ?? '';

    // 1. Campos obligatorios
    const emptyFields: string[] = [];
    if (!rut) emptyFields.push('rut');
    if (!password) emptyFields.push('password');
    if (emptyFields.length > 0) {
      throw new EmptyCredentialsException(emptyFields);
    }

    // 2. Formato del RUT
    if (!RUT_PATTERN.test(rut)) {
      throw new InvalidRutFormatException(rut);
    }

    // 3. Existencia del usuario
    const user = await this.authRepository.findByRut(rut);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 4. Cuenta deshabilitada
    if (user.status === 'DISABLED') {
      throw new AccountDisabledException(rut);
    }

    // 5. Autenticación correcta → redirección por rol
    return {
      role: user.role,
      redirectUrl: `/${user.role}/home`,
    };
  }
}
