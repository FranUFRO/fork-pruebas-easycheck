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

  async createSubject(dto: CreateSubjectDto): Promise<any> {
    return undefined;
  }
}
