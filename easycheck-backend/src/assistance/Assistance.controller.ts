import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AssistanceService, RegisterAssistanceDto } from './Assistance.service';
import type {
  UpdateRegistrationStatusDto,
  EditAssistanceDto,
} from './Assistance.service';
import { DirectorOrAdminGuard } from './DirectorOrAdmin.guard';
import {
  StudentNotFoundException,
  SubjectNotAssignedException,
  RegistrationDisabledException,
  DuplicateAssistanceException,
  InvalidQRException,
  InvalidRutException,
  ClassNotFoundException,
  RegistrationAlreadyDisabledException,
  RegistrationAlreadyEnabledException,
  AssistanceRecordNotFoundException,
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

  // GET /api/v1/students/:rut/attendance — CU-03: asistencia por asignatura
  // Solo Director de carrera o Administrador (DirectorOrAdminGuard).
  @Get('students/:rut/attendance')
  @UseGuards(DirectorOrAdminGuard)
  async getStudentAttendanceByRut(@Param('rut') rut: string) {
    try {
      return await this.assistanceService.getStudentAttendanceByRut(rut);
    } catch (e) {
      if (e instanceof InvalidRutException) {
        throw new BadRequestException({ error: e.message, rut: e.rut });
      }
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
      if (e instanceof ClassNotFoundException) {
        throw new NotFoundException({ error: e.message, classId: e.classId });
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

  // PATCH /api/v1/professors/:rut/classes/:id/registration — CU-07 / CU-08
  // Body: { "status": "DISABLED" } (CU-07) o { "status": "ENABLED" } (CU-08)
  @Patch('professors/:rut/classes/:id/registration')
  async updateRegistrationStatus(
    @Param('rut') professorRut: string,
    @Param('id', ParseIntPipe) classId: number,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    if (dto?.status !== 'ENABLED' && dto?.status !== 'DISABLED') {
      throw new BadRequestException({
        error: 'status must be ENABLED or DISABLED',
      });
    }

    try {
      return dto.status === 'DISABLED'
        ? await this.assistanceService.disableRegistration(
            professorRut,
            classId,
          )
        : await this.assistanceService.enableRegistration(
            professorRut,
            classId,
          );
    } catch (e) {
      if (e instanceof ClassNotFoundException) {
        throw new NotFoundException({ error: e.message, classId: e.classId });
      }
      if (e instanceof SubjectNotAssignedException) {
        throw new NotFoundException({
          error: 'Subject not assigned to professor',
          professorRut: e.professorRut,
          subjectCode: e.subjectCode,
        });
      }
      if (e instanceof RegistrationAlreadyDisabledException) {
        throw new ConflictException({ error: e.message, classId: e.classId });
      }
      if (e instanceof RegistrationAlreadyEnabledException) {
        throw new ConflictException({ error: e.message, classId: e.classId });
      }
      throw e;
    }
  }

  // PATCH /api/v1/professors/:rut/assistance/:id — CU-08: editar un registro
  // Body: { "present": true | false }
  @Patch('professors/:rut/assistance/:id')
  async editAssistance(
    @Param('rut') professorRut: string,
    @Param('id', ParseIntPipe) recordId: number,
    @Body() dto: EditAssistanceDto,
  ) {
    if (typeof dto?.present !== 'boolean') {
      throw new BadRequestException({ error: 'present must be a boolean' });
    }

    try {
      return await this.assistanceService.editAssistance(
        professorRut,
        recordId,
        dto.present,
      );
    } catch (e) {
      if (e instanceof AssistanceRecordNotFoundException) {
        throw new NotFoundException({ error: e.message, recordId: e.recordId });
      }
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
