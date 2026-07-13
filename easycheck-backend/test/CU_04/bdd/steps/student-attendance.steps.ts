import { defineFeature, loadFeature } from 'jest-cucumber';
import type { CurrentStudentAttendanceDto } from '../../../../src/assistance/Assistance.service';
import { StudentNotEnrolledException, StudentNotFoundException } from '../../../../src/common/exceptions';
import { createAssistanceContext } from '../../../SHARED/assistance-context';

const feature = loadFeature('test/CU_04/bdd/features/student-attendance.feature');

defineFeature(feature, (test) => {
  test('Estudiante consulta una asignatura matriculada', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: CurrentStudentAttendanceDto;
    given('el repositorio de asistencia del estudiante se encuentra disponible', () => {});
    given('el estudiante autenticado esta matriculado en una asignatura', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
      context.data.seedEnrollment('11111111-1', 'ASG-01');
      context.data.seedClass({ id: 1, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
      context.data.seedAssistance({ id: 1, studentRut: '11111111-1', classId: 1, subjectId: 'ASG-01', date: new Date(), present: true });
    });
    when('consulta su asistencia en la asignatura', async () => {
      result = await context.service.getCurrentStudentSubjectAttendance('11111111-1', 'ASG-01');
    });
    then('obtiene sus clases asistidas y el porcentaje', () => {
      expect(result).toMatchObject({ attendedClasses: 1, totalClasses: 1, attendancePercentage: 100 });
    });
  });

  test('Estudiante consulta una asignatura no matriculada', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de asistencia del estudiante se encuentra disponible', () => {});
    given('el estudiante autenticado no esta matriculado en la asignatura', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
    });
    when('consulta su asistencia en la asignatura no matriculada', async () => {
      try { await context.service.getCurrentStudentSubjectAttendance('11111111-1', 'ASG-01'); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la consulta por falta de matricula', () => {
      expect(error).toBeInstanceOf(StudentNotEnrolledException);
    });
  });

  test('Estudiante inexistente consulta su asistencia', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de asistencia del estudiante se encuentra disponible', () => {});
    given('no existe el estudiante autenticado', () => {});
    when('consulta su asistencia', async () => {
      try { await context.service.getCurrentStudentSubjectAttendance('11111111-1', 'ASG-01'); } catch (caught) { error = caught; }
    });
    then('el sistema informa que el estudiante no existe', () => {
      expect(error).toBeInstanceOf(StudentNotFoundException);
    });
  });

  test('Estudiante sin clases obtiene porcentaje cero', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: CurrentStudentAttendanceDto;
    given('el repositorio de asistencia del estudiante se encuentra disponible', () => {});
    given('el estudiante esta matriculado pero no tiene clases registradas', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
      context.data.seedEnrollment('11111111-1', 'ASG-01');
    });
    when('consulta su asistencia en la asignatura sin clases', async () => {
      result = await context.service.getCurrentStudentSubjectAttendance('11111111-1', 'ASG-01');
    });
    then('obtiene un porcentaje de 0', () => {
      expect(result).toMatchObject({ totalClasses: 0, attendancePercentage: 0 });
    });
  });
});
