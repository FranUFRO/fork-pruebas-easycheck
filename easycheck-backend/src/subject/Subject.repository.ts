import { Injectable } from '@nestjs/common';

export interface Subject {
  code: string;
  name: string;
  career: string;
}

@Injectable()
export class SubjectRepository {
  async findByCode(code: string): Promise<Subject | null> {
    return undefined as unknown as Subject | null;
  }

  async save(subject: Subject): Promise<Subject> {
    return undefined as unknown as Subject;
  }
}
