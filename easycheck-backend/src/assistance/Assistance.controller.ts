import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AssistanceService, RegisterAssistanceDto } from './Assistance.service';
import {
  StudentNotFoundException,
  SubjectNotAssignedException,
  RegistrationDisabledException,
  DuplicateAssistanceException,
  InvalidQRException,
} from '../common/exceptions';

@Controller('api/v1')
export class AssistanceController {
  constructor(private readonly assistanceService: AssistanceService) {}

  // GET /api/v1/students/:rut/assistance?subject=XXX
  @Get('students/:rut/assistance')
  async getStudentAssistance(
    @Param('rut') rut: string,
    @Query('subject') subject: string,
  ) {
    try {
      return await this.assistanceService.getStudentAssistance(rut, subject);
    } catch (e) {
      if (e instanceof StudentNotFoundException) {
        throw new NotFoundException({ error: 'Student not found', rut: e.rut });
      }
      throw e;
    }
  }

  // POST /api/v1/assistance/register
  @Post('assistance/register')
  @HttpCode(HttpStatus.CREATED)
  async registerAssistance(@Body() dto: RegisterAssistanceDto) {
    try {
      return await this.assistanceService.registerAssistanceQR(dto);
    } catch (e) {
      if (e instanceof InvalidQRException) {
        throw new BadRequestException({ error: e.message });
      }
      if (e instanceof RegistrationDisabledException) {
        throw new ConflictException({ error: e.message, classId: e.classId });
      }
      if (e instanceof DuplicateAssistanceException) {
        throw new ConflictException({ error: e.message });
      }
      throw e;
    }
  }

  // GET /api/v1/professors/:rut/subjects/:code/assistance
  @Get('professors/:rut/subjects/:code/assistance')
  async getSubjectAssistance(
    @Param('rut') rut: string,
    @Param('code') code: string,
  ) {
    try {
      return await this.assistanceService.getStudentsAssistanceBySubject(
        rut,
        code,
      );
    } catch (e) {
      if (e instanceof SubjectNotAssignedException) {
        throw new NotFoundException({
          error: 'Subject not assigned to professor',
          professorRut: e.professorRut,
          subjectCode: e.subjectCode,
        });
      }
      throw e;
    }
  }
}
