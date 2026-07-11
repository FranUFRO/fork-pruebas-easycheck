import { Injectable } from '@nestjs/common';
import { IsInt, IsString } from 'class-validator';
import {
  DataRepository,
  StudentAssistance,
  AssistanceRecord,
  StudentSubjectAttendance,
} from './Data.repository';
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

export interface StudentAssistanceDto {
  studentRut: string;
  subjectId: string;
  records: AssistanceRecord[];
  totalClasses: number;
  classesAttended: number;
  assistancePercentage: number;
}

// Con decoradores de class-validator: el ValidationPipe global de main.ts usa
// whitelist+forbidNonWhitelisted, y sin decoradores rechazaba TODO el body en
// el bootstrap real (los tests de integración no aplican el pipe global).
export class RegisterAssistanceDto {
  @IsString()
  studentRut!: string;

  @IsInt()
  classId!: number;

  @IsString()
  subjectId!: string;

  @IsString()
  qrSignature!: string;
}

export interface AssistanceConfirmationDto {
  message: string;
  recordId: number;
  studentRut: string;
  classId: number;
}

export interface StudentSubjectAttendanceDto extends StudentSubjectAttendance {
  attendancePercentage: number;
}

// CU-07 / CU-08 — body de PATCH professors/:rut/classes/:id/registration
export interface UpdateRegistrationStatusDto {
  status: 'ENABLED' | 'DISABLED';
}

// CU-08 — body de PATCH professors/:rut/assistance/:id
export interface EditAssistanceDto {
  present: boolean;
}

export interface RegistrationStatusConfirmationDto {
  message: string;
  classId: number;
  registrationStatus: 'ENABLED' | 'DISABLED';
}

export interface EditAssistanceConfirmationDto {
  message: string;
  recordId: number;
  studentRut: string;
  present: boolean;
}

@Injectable()
export class AssistanceService {
  constructor(private readonly dataRepository: DataRepository) {}

  async getStudentAttendanceByRut(
    rut: string,
  ): Promise<StudentSubjectAttendanceDto[]> {
    if (!this.isValidRut(rut)) {
      throw new InvalidRutException(rut);
    }

    const student = await this.dataRepository.findStudent(rut);
    if (!student) {
      throw new StudentNotFoundException(rut);
    }

    const attendanceRows =
      await this.dataRepository.findStudentAttendanceByRut(rut);

    return attendanceRows.map((row) => ({
      ...row,
      attendancePercentage:
        row.totalClasses > 0
          ? Math.round((row.attendedClasses / row.totalClasses) * 100)
          : 0,
    }));
  }

  private isValidRut(rut: string): boolean {
    const cleanRut = rut.replaceAll('.', '').toUpperCase();
    const match = /^(\d{7,8})-([\dK])$/.exec(cleanRut);

    if (!match) {
      return false;
    }

    const [, body, verifier] = match;
    let multiplier = 2;
    let sum = 0;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedValue = 11 - (sum % 11);
    const verifierIfNotEleven = expectedValue === 10 ? 'K' : `${expectedValue}`;
    const expectedVerifier = expectedValue === 11 ? '0' : verifierIfNotEleven;

    return verifier === expectedVerifier;
  }

  // ── IT-1 / IT-2: Show a student's assistance ─────────────────────────────
  async getStudentAssistance(
    studentRut: string,
    subjectId: string,
  ): Promise<StudentAssistanceDto> {
    const student = await this.dataRepository.findStudent(studentRut);
    if (!student) {
      throw new StudentNotFoundException(studentRut);
    }

    const records =
      await this.dataRepository.findAssistancesByStudentAndSubject(
        studentRut,
        subjectId,
      );

    const classesAttended = records.filter((r) => r.present).length;
    const totalClasses = records.length;
    const assistancePercentage =
      totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 100) : 0;

    return {
      studentRut,
      subjectId,
      records,
      totalClasses,
      classesAttended,
      assistancePercentage,
    };
  }

  // ── IT-3 / IT-4: Register assistance via QR ──────────────────────────────
  async registerAssistanceQR(
    dto: RegisterAssistanceDto,
  ): Promise<AssistanceConfirmationDto> {
    // Validate QR signature (simplified stub: any non-empty signature is valid)
    if (!dto.qrSignature || dto.qrSignature === 'INVALID_SIGNATURE') {
      throw new InvalidQRException();
    }

    const classSession = await this.dataRepository.findClass(dto.classId);
    if (!classSession) {
      throw new ClassNotFoundException(dto.classId);
    }

    if (classSession.registrationStatus === 'DISABLED') {
      throw new RegistrationDisabledException(dto.classId);
    }

    const alreadyRegistered = await this.dataRepository.assistanceExists(
      dto.studentRut,
      dto.classId,
    );
    if (alreadyRegistered) {
      throw new DuplicateAssistanceException(dto.studentRut, dto.classId);
    }

    const record = await this.dataRepository.insertAssistance({
      studentRut: dto.studentRut,
      classId: dto.classId,
      subjectId: dto.subjectId,
      date: new Date(),
      present: true,
    });

    return {
      message: 'Assistance registered successfully',
      recordId: record.id,
      studentRut: dto.studentRut,
      classId: dto.classId,
    };
  }

  // ── IT-5 / IT-6: Show assistance of students in a subject ────────────────
  async getStudentsAssistanceBySubject(
    professorRut: string,
    subjectId: string,
  ): Promise<StudentAssistance[]> {
    const teaches = await this.dataRepository.findTeaching(
      professorRut,
      subjectId,
    );
    if (!teaches) {
      throw new SubjectNotAssignedException(professorRut, subjectId);
    }

    return this.dataRepository.findStudentsAssistanceBySubject(subjectId);
  }

  // ── CU-07: Disable assistance registration for a class ───────────────────
  async disableRegistration(
    professorRut: string,
    classId: number,
  ): Promise<RegistrationStatusConfirmationDto> {
    const classSession = await this.assertProfessorOwnsClass(
      professorRut,
      classId,
    );

    if (classSession.registrationStatus === 'DISABLED') {
      throw new RegistrationAlreadyDisabledException(classId);
    }

    await this.dataRepository.updateClassRegistrationStatus(
      classId,
      'DISABLED',
    );

    return {
      message: 'Registration disabled successfully',
      classId,
      registrationStatus: 'DISABLED',
    };
  }

  // ── CU-08: Re-enable assistance registration for a class ─────────────────
  async enableRegistration(
    professorRut: string,
    classId: number,
  ): Promise<RegistrationStatusConfirmationDto> {
    const classSession = await this.assertProfessorOwnsClass(
      professorRut,
      classId,
    );

    if (classSession.registrationStatus === 'ENABLED') {
      throw new RegistrationAlreadyEnabledException(classId);
    }

    await this.dataRepository.updateClassRegistrationStatus(classId, 'ENABLED');

    return {
      message: 'Registration enabled successfully',
      classId,
      registrationStatus: 'ENABLED',
    };
  }

  // ── CU-08: Edit a student's assistance record (present/absent) ───────────
  async editAssistance(
    professorRut: string,
    recordId: number,
    present: boolean,
  ): Promise<EditAssistanceConfirmationDto> {
    const record = await this.dataRepository.findAssistanceById(recordId);
    if (!record) {
      throw new AssistanceRecordNotFoundException(recordId);
    }

    const teaches = await this.dataRepository.findTeaching(
      professorRut,
      record.subjectId,
    );
    if (!teaches) {
      throw new SubjectNotAssignedException(professorRut, record.subjectId);
    }

    await this.dataRepository.updateAssistancePresence(recordId, present);

    return {
      message: 'Assistance record updated successfully',
      recordId,
      studentRut: record.studentRut,
      present,
    };
  }

  // Shared CU-07/CU-08 check: the class exists and the professor teaches it.
  private async assertProfessorOwnsClass(
    professorRut: string,
    classId: number,
  ) {
    const classSession = await this.dataRepository.findClass(classId);
    if (!classSession) {
      throw new ClassNotFoundException(classId);
    }

    const teaches = await this.dataRepository.findTeaching(
      professorRut,
      classSession.subjectId,
    );
    if (!teaches) {
      throw new SubjectNotAssignedException(
        professorRut,
        classSession.subjectId,
      );
    }

    return classSession;
  }
}
