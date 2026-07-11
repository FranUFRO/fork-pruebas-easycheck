import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './Subject.repository';
import { SubjectEntity } from '../database/entities/subject.entity';

/**
 * Implementación Postgres/TypeORM de SubjectRepository. Mismo token y
 * mismas firmas async cuando `DB_HOST` está definido.
 */
@Injectable()
export class TypeOrmSubjectRepository {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjects: Repository<SubjectEntity>,
  ) {}

  async findByCode(code: string): Promise<Subject | null> {
    return this.subjects.findOneBy({ code });
  }

  async save(subject: Subject): Promise<Subject> {
    return this.subjects.save(this.subjects.create(subject));
  }
}
