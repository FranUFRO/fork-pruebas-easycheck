import { Column, Entity, PrimaryColumn } from 'typeorm';

// Refleja la forma de `Subject` en Subject.repository.ts: { code, name, career }.
@Entity({ name: 'subjects' })
export class SubjectEntity {
  @PrimaryColumn({ length: 20 })
  code!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 120 })
  career!: string;
}
