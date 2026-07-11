import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// Roles con permiso para consultar la asistencia de un estudiante (CU-03).
export const ATTENDANCE_QUERY_ROLES = ['director', 'administrador'];

interface AuthenticatedRequest {
  headers?: { authorization?: string };
  user?: { role?: string };
}

@Injectable()
export class DirectorOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.headers?.authorization;
    if (!token) {
      throw new UnauthorizedException({ message: 'Token no proporcionado' });
    }

    const role = request.user?.role;
    if (!role || !ATTENDANCE_QUERY_ROLES.includes(role)) {
      throw new ForbiddenException({
        message: 'No tiene permisos para realizar esta acción',
      });
    }

    return true;
  }
}
