import { Column, Entity, PrimaryColumn } from 'typeorm';

// Refleja la forma de `AuthUser` en Auth.repository.ts:
// { rut, role, status }. `role` es varchar (no enum) porque el seed también
// registra roles 'director' y 'administrador' que el tipo in-memory aún no
// modela pero los guards sí usan (x-user-role).
@Entity({ name: 'auth_users' })
export class AuthUserEntity {
  @PrimaryColumn({ length: 12 })
  rut!: string;

  @Column({ length: 30 })
  role!: string;

  @Column({ type: 'enum', enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' })
  status!: 'ACTIVE' | 'DISABLED';
}
