import { Injectable } from '@nestjs/common';
import { Subject, SubjectRepository } from './Subject.repository';
import {
  MissingFieldsException,
  InvalidFieldFormatException,
  SubjectAlreadyExistsException,
} from '../common/exceptions';

export interface CreateSubjectDto {
  code: string;
  name: string;
  career: string;
}

@Injectable()
export class SubjectService {
  private readonly invalidCharsRegex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s-]/;

  constructor(private readonly subjectRepository: SubjectRepository) {}

  async createSubject(
    dto: CreateSubjectDto,
  ): Promise<{ message: string; subject: Subject }> {
    this.validateRequiredFields(dto);
    this.validateFieldFormat(dto);
    await this.assertCodeIsUnique(dto.code);
    const saved = await this.subjectRepository.save(dto);
    return { message: 'Asignatura registrada correctamente', subject: saved };
  }

  private validateRequiredFields(dto: CreateSubjectDto): void {
    const missingFields = (['code', 'name', 'career'] as const).filter(
      (field) => !dto[field] || dto[field].trim() === '',
    );
    if (missingFields.length > 0) {
      throw new MissingFieldsException(missingFields);
    }
  }

  private validateFieldFormat(dto: CreateSubjectDto): void {
    const invalidField = (['code', 'name', 'career'] as const).find((field) =>
      this.invalidCharsRegex.test(dto[field]),
    );
    if (invalidField) {
      throw new InvalidFieldFormatException(invalidField);
    }
  }

  private async assertCodeIsUnique(code: string): Promise<void> {
    const existing = await this.subjectRepository.findByCode(code);
    if (existing) {
      throw new SubjectAlreadyExistsException(code);
    }
  }
}
