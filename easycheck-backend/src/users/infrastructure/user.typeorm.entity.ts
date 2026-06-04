import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserRole } from '../domain/user-role.enum';

@Entity({ name: 'users' })
@Unique(['rut'])
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 12 })
  rut!: string;

  @Column({ length: 120 })
  institutionalEmail!: string;

  @Column({ length: 120 })
  fullName!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;
}
