import { Injectable } from '@nestjs/common';
import { SubjectRepository } from './Subject.repository';

export interface CreateSubjectDto {
  code: string;
  name: string;
  career: string;
}

@Injectable()
export class SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async createSubject(dto: CreateSubjectDto): Promise<{ message: string }> {
    // 1. Validar campos obligatorios
    const missingFields = (['code', 'name', 'career'] as const).filter(
      (field) => !dto[field] || dto[field].trim() === '',
    );
    if (missingFields.length > 0) {
      throw new Error('Debe completar los datos obligatorios');
    }

    // 2. Validar caracteres no permitidos
    const invalidCharsRegex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s-]/;
    if (
      invalidCharsRegex.test(dto.code) ||
      invalidCharsRegex.test(dto.name) ||
      invalidCharsRegex.test(dto.career)
    ) {
      throw new Error('Caracteres no permitidos');
    }

    // 3. Verificar que el código no exista previamente
    const existing = await this.subjectRepository.findByCode(dto.code);
    if (existing) {
      throw new Error('El código ingresado ya existe en el sistema');
    }

    // 4. Guardar la asignatura y retornar el mensaje de éxito
    await this.subjectRepository.save({
      code: dto.code,
      name: dto.name,
      career: dto.career,
    });

    return { message: 'Asignatura registrada correctamente' };
  }
}
