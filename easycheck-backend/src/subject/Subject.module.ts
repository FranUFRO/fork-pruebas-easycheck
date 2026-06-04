import { Module } from '@nestjs/common';
import { SubjectController } from './Subject.controller';
import { SubjectService } from './Subject.service';
import { SubjectRepository } from './Subject.repository';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, SubjectRepository],
})
export class SubjectModule {}
