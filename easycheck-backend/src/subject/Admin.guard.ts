import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// Rol con permisos para administrar asignaturas.
export const ADMIN_ROLE = 'administrador';

interface AuthenticatedRequest {
  headers?: { authorization?: string };
  user?: { role?: string };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.headers?.authorization;
    if (!token) {
      throw new UnauthorizedException({ message: 'Token no proporcionado' });
    }

    const role = request.user?.role;
    if (role !== ADMIN_ROLE) {
      throw new ForbiddenException({
        message: 'No tiene permisos para realizar esta acción',
      });
    }

    return true;
  }
}
