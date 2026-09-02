import { defineFeature, loadFeature } from 'jest-cucumber';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from '../../../../src/subject/Admin.guard';
import { SubjectRepository } from '../../../../src/subject/Subject.repository';
import { SubjectService } from '../../../../src/subject/Subject.service';
import { InvalidFieldFormatException, MissingFieldsException, SubjectAlreadyExistsException } from '../../../../src/common/exceptions';

const feature = loadFeature('test/CU_09/bdd/features/create-subject.feature');

const mockContext = (request: { headers?: { authorization?: string }; user?: { role?: string } }): ExecutionContext => ({
  switchToHttp: () => ({ getRequest: () => request }),
}) as unknown as ExecutionContext;

defineFeature(feature, (test) => {
  test('Administrador registra una asignatura local', ({ given, when, then }) => {
    const repository = new SubjectRepository();
    const service = new SubjectService(repository);
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    given('no existe una asignatura con el codigo indicado', async () => {
      await expect(repository.findByCode('INF-301')).resolves.toBeNull();
    });
    when('el administrador registra la nueva asignatura', async () => {
      await service.createSubject({ code: 'INF-301', name: 'Ingenieria de Software', career: 'Ingenieria Informatica' });
    });
    then('la asignatura queda almacenada con origen local', async () => {
      await expect(repository.findByCode('INF-301')).resolves.toMatchObject({ source: 'LOCAL' });
    });
  });

  test('Administrador registra una asignatura duplicada', ({ given, when, then }) => {
    const repository = new SubjectRepository();
    const service = new SubjectService(repository);
    let error: unknown;
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    given('ya existe una asignatura con el codigo indicado', async () => {
      await repository.save({ code: 'INF-301', name: 'Existente', career: 'Informatica', source: 'LOCAL' });
    });
    when('el administrador intenta registrar nuevamente la asignatura', async () => {
      try { await service.createSubject({ code: 'INF-301', name: 'Nueva', career: 'Informatica' }); } catch (caught) { error = caught; }
    });
    then('el sistema informa que el codigo ya existe', () => expect(error).toBeInstanceOf(SubjectAlreadyExistsException));
  });

  test('Administrador registra una asignatura sin datos obligatorios', ({ given, when, then }) => {
    const service = new SubjectService(new SubjectRepository());
    let error: unknown;
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    when('registra una asignatura con campos obligatorios vacios', async () => {
      try { await service.createSubject({ code: '', name: '', career: '' }); } catch (caught) { error = caught; }
    });
    then('el sistema informa que faltan datos obligatorios', () => expect(error).toBeInstanceOf(MissingFieldsException));
  });

  test('Administrador registra una asignatura con caracteres invalidos', ({ given, when, then }) => {
    const service = new SubjectService(new SubjectRepository());
    let error: unknown;
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    when('registra una asignatura con caracteres no permitidos', async () => {
      try { await service.createSubject({ code: 'INF-301', name: 'Calculo#1@', career: 'Informatica' }); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza el formato de la asignatura', () => expect(error).toBeInstanceOf(InvalidFieldFormatException));
  });

  test('Administrador registra una asignatura con espacios', ({ given, when, then }) => {
    const repository = new SubjectRepository();
    const service = new SubjectService(repository);
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    when('registra una asignatura con espacios al inicio y al final', async () => {
      await service.createSubject({ code: ' INF-302 ', name: ' Arquitectura ', career: ' Informatica ' });
    });
    then('el sistema normaliza los datos y conserva el origen local', async () => {
      await expect(repository.findByCode('INF-302')).resolves.toEqual({ code: 'INF-302', name: 'Arquitectura', career: 'Informatica', source: 'LOCAL' });
    });
  });

  test('Usuario sin token intenta registrar una asignatura', ({ given, when, then }) => {
    const guard = new AdminGuard();
    let error: unknown;
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    when('un usuario sin token intenta registrar una asignatura', () => {
      try { guard.canActivate(mockContext({ headers: {} })); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la solicitud con estado 401', () => {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as UnauthorizedException).getStatus()).toBe(401);
    });
  });

  test('Usuario sin rol administrador intenta registrar una asignatura', ({ given, when, then }) => {
    const guard = new AdminGuard();
    let error: unknown;
    given('el repositorio de asignaturas se encuentra disponible', () => {});
    when('un usuario sin rol administrador intenta registrar una asignatura', () => {
      try { guard.canActivate(mockContext({ headers: { authorization: 'Bearer token' }, user: { role: 'profesor' } })); } catch (caught) { error = caught; }
    });
    then('el sistema rechaza la solicitud con estado 403', () => {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getStatus()).toBe(403);
    });
  });
});
