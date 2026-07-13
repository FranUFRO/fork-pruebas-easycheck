import { defineFeature, loadFeature } from 'jest-cucumber';
import { AssistanceRecordNotFoundException, EditingAlreadyEnabledException, EditingDisabledException, RegistrationMustBeDisabledException, SubjectNotAssignedException } from '../../../../src/common/exceptions';
import { createAssistanceContext } from '../../../SHARED/assistance-context';

const feature = loadFeature('test/CU_08/bdd/features/edit-attendance.feature');

const seedEditingContext = (context: ReturnType<typeof createAssistanceContext>, registrationStatus: 'ENABLED' | 'DISABLED', editingStatus: 'ENABLED' | 'DISABLED') => {
  context.data.seedTeaching('22222222-2', 'ASG-01');
  context.data.seedClass({ id: 1001, subjectId: 'ASG-01', date: new Date(), registrationStatus, editingStatus });
  context.data.seedAssistance({ id: 10, studentRut: '11111111-1', classId: 1001, subjectId: 'ASG-01', date: new Date(), present: true });
};

defineFeature(feature, (test) => {
  test('Profesor corrige asistencia durante la ventana de edicion', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let result: { present: boolean };
    given('el repositorio de edicion se encuentra disponible', () => {});
    given('la clase esta cerrada y tiene una asistencia registrada', () => seedEditingContext(context, 'DISABLED', 'DISABLED'));
    when('el profesor habilita edicion y corrige la asistencia', async () => {
      await context.service.enableEditing('22222222-2', 1001);
      result = await context.service.editAssistance('22222222-2', 10, false);
    });
    then('el registro cambia sin reabrir nuevos registros', async () => {
      expect(result).toMatchObject({ present: false });
      await expect(context.data.findAssistanceById(10)).resolves.toMatchObject({ present: false });
      await expect(context.data.findClass(1001)).resolves.toMatchObject({ registrationStatus: 'DISABLED', editingStatus: 'ENABLED' });
    });
  });

  test('Profesor intenta editar mientras el registro esta abierto', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de edicion se encuentra disponible', () => {});
    given('la clase mantiene el registro abierto', () => seedEditingContext(context, 'ENABLED', 'DISABLED'));
    when('intenta habilitar la edicion', async () => {
      try { await context.service.enableEditing('22222222-2', 1001); } catch (caught) { error = caught; }
    });
    then('el sistema exige cerrar primero el registro', () => expect(error).toBeInstanceOf(RegistrationMustBeDisabledException));
  });

  test('Profesor habilita una edicion ya habilitada', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de edicion se encuentra disponible', () => {});
    given('la clase cerrada ya tiene la edicion habilitada', () => seedEditingContext(context, 'DISABLED', 'ENABLED'));
    when('intenta habilitar nuevamente la edicion', async () => {
      try { await context.service.enableEditing('22222222-2', 1001); } catch (caught) { error = caught; }
    });
    then('el sistema informa que la edicion ya estaba habilitada', () => expect(error).toBeInstanceOf(EditingAlreadyEnabledException));
  });

  test('Profesor corrige una asistencia fuera de la ventana de edicion', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de edicion se encuentra disponible', () => {});
    given('la clase esta cerrada pero la edicion esta deshabilitada', () => seedEditingContext(context, 'DISABLED', 'DISABLED'));
    when('intenta corregir la asistencia', async () => {
      try { await context.service.editAssistance('22222222-2', 10, false); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la correccion por edicion deshabilitada', () => expect(error).toBeInstanceOf(EditingDisabledException));
  });

  test('Profesor corrige una asistencia de una asignatura ajena', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de edicion se encuentra disponible', () => {});
    given('el profesor no imparte la asignatura del registro', () => {
      context.data.seedTeaching('33333333-3', 'ASG-01');
      context.data.seedClass({ id: 1001, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'DISABLED', editingStatus: 'ENABLED' });
      context.data.seedAssistance({ id: 10, studentRut: '11111111-1', classId: 1001, subjectId: 'ASG-01', date: new Date(), present: true });
    });
    when('intenta corregir la asistencia ajena', async () => {
      try { await context.service.editAssistance('22222222-2', 10, false); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la correccion por falta de asignacion', () => expect(error).toBeInstanceOf(SubjectNotAssignedException));
  });

  test('Profesor corrige un registro inexistente', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de edicion se encuentra disponible', () => {});
    given('no existe el registro de asistencia indicado', () => {});
    when('intenta corregir el registro inexistente', async () => {
      try { await context.service.editAssistance('22222222-2', 9999, false); } catch (caught) { error = caught; }
    });
    then('el sistema informa que el registro no existe', () => expect(error).toBeInstanceOf(AssistanceRecordNotFoundException));
  });
});
