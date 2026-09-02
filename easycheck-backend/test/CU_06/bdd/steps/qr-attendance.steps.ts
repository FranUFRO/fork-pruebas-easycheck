import { defineFeature, loadFeature } from 'jest-cucumber';
import { RegistrationDisabledException, StudentNotEnrolledException, ClassNotFoundException, DuplicateAssistanceException, InvalidQRException } from '../../../../src/common/exceptions';
import { createAssistanceContext } from '../../../SHARED/assistance-context';

const feature = loadFeature('test/CU_06/bdd/features/qr-attendance.feature');

const seedStudentAndClass = (context: ReturnType<typeof createAssistanceContext>, status: 'ENABLED' | 'DISABLED' = 'ENABLED') => {
  context.data.seedStudent('11111111-1', 'Estudiante Uno');
  context.data.seedEnrollment('11111111-1', 'ASG-01');
  context.data.seedClass({ id: 1001, subjectId: 'ASG-01', date: new Date(), registrationStatus: status });
};

defineFeature(feature, (test) => {
  test('Estudiante genera QR y el lector registra asistencia', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let recordId: number | undefined;
    given('el repositorio de QR se encuentra disponible', () => {});
    given('el estudiante esta matriculado en una clase habilitada', () => seedStudentAndClass(context));
    when('genera su QR y el lector lo valida', async () => {
      const generated = await context.service.generateStudentQr('11111111-1', 1001);
      const registered = await context.service.registerAssistanceQR({ qrToken: generated.qrToken });
      recordId = registered.recordId;
    });
    then('la asistencia queda registrada una sola vez', async () => {
      expect(recordId).toBeDefined();
      await expect(context.data.assistanceExists('11111111-1', 1001)).resolves.toBe(true);
    });
  });

  test('El QR alterado es rechazado', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de QR se encuentra disponible', () => {});
    given('el estudiante esta matriculado en una clase habilitada', () => seedStudentAndClass(context));
    when('el lector intenta validar un QR alterado', async () => {
      const generated = await context.service.generateStudentQr('11111111-1', 1001);
      try { await context.service.registerAssistanceQR({ qrToken: `${generated.qrToken}x` }); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza el QR por firma invalida', () => {
      expect(error).toBeInstanceOf(InvalidQRException);
    });
  });

  test('No se genera QR para una clase cerrada', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de QR se encuentra disponible', () => {});
    given('el estudiante esta matriculado en una clase cerrada', () => seedStudentAndClass(context, 'DISABLED'));
    when('intenta generar su QR', async () => {
      try { await context.service.generateStudentQr('11111111-1', 1001); } catch (caught) { error = caught; }
    });
    then('el sistema informa que el registro esta cerrado', () => {
      expect(error).toBeInstanceOf(RegistrationDisabledException);
    });
  });

  test('No se genera QR para un estudiante no matriculado', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de QR se encuentra disponible', () => {});
    given('el estudiante no esta matriculado en la asignatura de la clase', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
      context.data.seedClass({ id: 1001, subjectId: 'ASG-01', date: new Date(), registrationStatus: 'ENABLED' });
    });
    when('intenta generar su QR', async () => {
      try { await context.service.generateStudentQr('11111111-1', 1001); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la generacion por falta de matricula', () => {
      expect(error).toBeInstanceOf(StudentNotEnrolledException);
    });
  });

  test('No se registra un QR dos veces', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    let token = '';
    given('el repositorio de QR se encuentra disponible', () => {});
    given('existe un QR valido ya utilizado para la clase', async () => {
      seedStudentAndClass(context);
      token = (await context.service.generateStudentQr('11111111-1', 1001)).qrToken;
      await context.service.registerAssistanceQR({ qrToken: token });
    });
    when('el lector intenta reutilizar el mismo QR', async () => {
      try { await context.service.registerAssistanceQR({ qrToken: token }); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza el registro duplicado', () => {
      expect(error).toBeInstanceOf(DuplicateAssistanceException);
    });
  });

  test('No se genera QR para una clase inexistente', ({ given, when, then }) => {
    const context = createAssistanceContext();
    let error: unknown;
    given('el repositorio de QR se encuentra disponible', () => {});
    given('no existe la clase solicitada', () => {
      context.data.seedStudent('11111111-1', 'Estudiante Uno');
    });
    when('intenta generar su QR', async () => {
      try { await context.service.generateStudentQr('11111111-1', 9999); } catch (caught) { error = caught; }
    });
    then('el sistema informa que la clase no existe', () => {
      expect(error).toBeInstanceOf(ClassNotFoundException);
    });
  });
});
