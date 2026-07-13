import { defineFeature, loadFeature } from 'jest-cucumber';
import { ClassNotFoundException, RegistrationAlreadyDisabledException, SubjectNotAssignedException } from '../../../../src/common/exceptions';
import { createAssistanceContext } from '../../../SHARED/assistance-context';

const feature = loadFeature('test/CU_07/bdd/features/close-registration.feature');

const seedClass = (context: ReturnType<typeof createAssistanceContext>, status: 'ENABLED' | 'DISABLED' = 'ENABLED') => {
  context.data.seedTeaching('22222222-2', 'ASG-01');
  context.data.seedClass({ id: 1001, subjectId: 'ASG-01', date: new Date(), registrationStatus: status });
};

defineFeature(feature, (test) => {
  test('Profesor cierra nuevos registros de su clase', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: { registrationStatus: string };
    given('el repositorio de clases se encuentra disponible', () => {});
    given('el profesor imparte una clase con registro habilitado', () => seedClass(context));
    when('cierra el registro de asistencia', async () => { result = await context.service.disableRegistration('22222222-2', 1001); });
    then('la clase deja de aceptar nuevos registros', async () => {
      expect(result).toMatchObject({ registrationStatus: 'DISABLED' });
      await expect(context.data.findClass(1001)).resolves.toMatchObject({ registrationStatus: 'DISABLED' });
    });
  });

  test('Profesor cierra una clase ya cerrada', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de clases se encuentra disponible', () => {});
    given('el profesor imparte una clase con registro ya cerrado', () => seedClass(context, 'DISABLED'));
    when('intenta cerrar nuevamente el registro', async () => {
      try { await context.service.disableRegistration('22222222-2', 1001); } catch (caught) { error = caught; }
    });
    then('el sistema informa que el registro ya estaba cerrado', () => expect(error).toBeInstanceOf(RegistrationAlreadyDisabledException));
  });

  test('Profesor cierra una clase que no imparte', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de clases se encuentra disponible', () => {});
    given('el profesor no imparte la asignatura de la clase', () => {
      context.data.seedTeaching('33333333-3', 'ASG-01');
      context.data.seedClass({ id: 1001, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
    });
    when('intenta cerrar el registro de la clase no asignada', async () => {
      try { await context.service.disableRegistration('22222222-2', 1001); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la operacion por falta de asignacion', () => expect(error).toBeInstanceOf(SubjectNotAssignedException));
  });

  test('Profesor cierra una clase inexistente', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de clases se encuentra disponible', () => {});
    given('no existe la clase que se desea cerrar', () => {});
    when('intenta cerrar el registro de la clase inexistente', async () => {
      try { await context.service.disableRegistration('22222222-2', 9999); } catch (caught) { error = caught; }
    });
    then('el sistema informa que la clase no existe', () => expect(error).toBeInstanceOf(ClassNotFoundException));
  });
});
