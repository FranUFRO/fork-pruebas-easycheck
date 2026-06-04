import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SubjectService, CreateSubjectDto } from './Subject.service';

@Controller('api/v1/subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSubjectDto): Promise<{ message: string }> {
    return await this.subjectService.createSubject(dto);
  }
}
