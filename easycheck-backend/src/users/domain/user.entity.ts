import { UserRole } from './user-role.enum';

export interface User {
  id: string;
  rut: string;
  institutionalEmail: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
}

export interface InstitutionalUser {
  rut: string;
  institutionalEmail: string;
  fullName: string;
  role: UserRole;
}
