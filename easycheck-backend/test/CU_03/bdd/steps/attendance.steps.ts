import { defineFeature, loadFeature } from 'jest-cucumber';
import type { StudentSubjectAttendanceDto } from '../../../../src/assistance/Assistance.service';
import {
  InvalidRutException,
  StudentNotFoundException,
} from '../../../../src/common/exceptions';
import { createAssistanceContext } from '../../../SHARED/assistance-context';

const feature = loadFeature('test/CU_03/bdd/features/attendance.feature');

const seedHalfAttendance = (context: ReturnType<typeof createAssistanceContext>) => {
  context.data.seedStudent('11111111-1', 'Estudiante Uno');
  context.data.seedEnrollment('11111111-1', 'ASG-01');
  context.data.seedClass({ id: 1, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
  context.data.seedClass({ id: 2, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
  context.data.seedAssistance({ id: 1, studentRut: '11111111-1', classId: 1, subjectId: 'ASG-01', date: new Date(), present: true });
};

defineFeature(feature, (test) => {
  test('Director consulta la asistencia por RUT', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: StudentSubjectAttendanceDto[] = [];
    given('el repositorio de asistencia se encuentra disponible', () => {});
    given('existe un estudiante matriculado con una clase asistida de dos', () => seedHalfAttendance(context));
    when('el director consulta la asistencia del estudiante', async () => {
      result = await context.service.getStudentAttendanceByRut('11111111-1');
    });
    then('obtiene un porcentaje de asistencia de 50', () => {
      expect(result).toEqual([expect.objectContaining({ attendancePercentage: 50 })]);
    });
  });

  test('Director consulta un RUT con formato invalido', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de asistencia se encuentra disponible', () => {});
    when('el director consulta la asistencia con un RUT invalido', async () => {
      try { await context.service.getStudentAttendanceByRut('rut-invalido'); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la consulta por formato de RUT', () => {
      expect(error).toBeInstanceOf(InvalidRutException);
    });
  });

  test('Director consulta un estudiante inexistente', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de asistencia se encuentra disponible', () => {});
    given('no existe un estudiante con el RUT consultado', () => {});
    when('el director consulta la asistencia del estudiante inexistente', async () => {
      try { await context.service.getStudentAttendanceByRut('11111111-1'); } catch (caught) { error = caught; }
    });
    then('el sistema informa que el estudiante no existe', () => {
      expect(error).toBeInstanceOf(StudentNotFoundException);
    });
  });

  test('Estudiante sin clases registra porcentaje cero', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: StudentSubjectAttendanceDto[] = [];
    given('el repositorio de asistencia se encuentra disponible', () => {});
    given('existe un estudiante matriculado sin clases registradas', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
      context.data.seedEnrollment('11111111-1', 'ASG-01');
    });
    when('el director consulta la asistencia del estudiante sin clases', async () => {
      result = await context.service.getStudentAttendanceByRut('11111111-1');
    });
    then('obtiene un porcentaje de asistencia de 0', () => {
      expect(result).toEqual([expect.objectContaining({ attendancePercentage: 0, totalClasses: 0 })]);
    });
  });
});
