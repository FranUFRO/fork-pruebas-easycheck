import { defineFeature, loadFeature } from 'jest-cucumber';
import type { StudentAssistance } from '../../../../src/assistance/Data.repository';
import { SubjectNotAssignedException } from '../../../../src/common/exceptions';
import { createAssistanceContext } from '../../../SHARED/assistance-context';

const feature = loadFeature('test/CU_05/bdd/features/professor-attendance.feature');

defineFeature(feature, (test) => {
  test('Profesor consulta estudiantes de su asignatura', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: StudentAssistance[] = [];
    given('el repositorio de asistencia del profesor se encuentra disponible', () => {});
    given('el profesor imparte una asignatura con estudiantes', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
      context.data.seedEnrollment('11111111-1', 'ASG-01');
      context.data.seedTeaching('22222222-2', 'ASG-01');
      context.data.seedClass({ id: 1, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
    });
    when('consulta la asistencia de la asignatura', async () => {
      result = await context.service.getStudentsAssistanceBySubject('22222222-2', 'ASG-01');
    });
    then('obtiene la lista de estudiantes y sus porcentajes', () => {
      expect(result).toEqual([expect.objectContaining({ rut: '11111111-1', assistancePercentage: 0 })]);
    });
  });

  test('Profesor consulta una asignatura que no imparte', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de asistencia del profesor se encuentra disponible', () => {});
    given('el profesor no imparte la asignatura consultada', () => {});
    when('consulta la asistencia de la asignatura no asignada', async () => {
      try { await context.service.getStudentsAssistanceBySubject('22222222-2', 'ASG-01'); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la consulta del profesor', () => {
      expect(error).toBeInstanceOf(SubjectNotAssignedException);
    });
  });

  test('Profesor consulta una asignatura sin estudiantes', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: StudentAssistance[] = [];
    given('el repositorio de asistencia del profesor se encuentra disponible', () => {});
    given('el profesor imparte una asignatura sin estudiantes matriculados', () => {
      context.data.seedTeaching('22222222-2', 'ASG-01');
    });
    when('consulta la asistencia de la asignatura vacia', async () => {
      result = await context.service.getStudentsAssistanceBySubject('22222222-2', 'ASG-01');
    });
    then('obtiene una lista de asistencia vacia', () => {
      expect(result).toEqual([]);
    });
  });

  test('Profesor obtiene el porcentaje de un estudiante ausente', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: StudentAssistance[] = [];
    given('el repositorio de asistencia del profesor se encuentra disponible', () => {});
    given('el profesor imparte una asignatura con un estudiante ausente', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
      context.data.seedEnrollment('11111111-1', 'ASG-01');
      context.data.seedTeaching('22222222-2', 'ASG-01');
      context.data.seedClass({ id: 1, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
      context.data.seedAssistance({ id: 1, studentRut: '11111111-1', classId: 1, subjectId: 'ASG-01', date: new Date(), present: false });
    });
    when('consulta la asistencia de la asignatura con inasistencia', async () => {
      result = await context.service.getStudentsAssistanceBySubject('22222222-2', 'ASG-01');
    });
    then('obtiene un porcentaje de asistencia de 0 para el estudiante', () => {
      expect(result).toEqual([expect.objectContaining({ rut: '11111111-1', assistancePercentage: 0 })]);
    });
  });
});
