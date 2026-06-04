import { SubjectService } from '../../src/subject/Subject.service';

describe('CU-09 Registro de nueva asignatura (TDD)', () => {
  let service: SubjectService;
  let repository: {
    findByCode: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      findByCode: jest.fn(),
      save: jest.fn(),
    };
    // Inyectamos el repositorio mockeado, NO el repositorio real.
    service = new SubjectService(repository as any);
  });

  it('TC-CU09-01: registra una asignatura con datos válidos', async () => {
    repository.findByCode.mockResolvedValue(null);
    repository.save.mockImplementation(async (subject) => subject);

    const result = await service.createSubject({
      code: 'INF-301',
      name: 'Ingeniería de Software',
      career: 'Ingeniería Informática',
    });

    expect(result).toEqual(
      expect.objectContaining({
        message: 'Asignatura registrada correctamente',
      }),
    );
  });

  it('TC-CU09-02: rechaza el registro cuando faltan datos obligatorios', async () => {
    await expect(
      service.createSubject({ code: '', name: '', career: '' }),
    ).rejects.toThrow('Debe completar los datos obligatorios');
  });

  it('TC-CU09-03: rechaza el registro cuando el código ya existe', async () => {
    repository.findByCode.mockResolvedValue({
      code: 'INF-301',
      name: 'Ingeniería de Software',
      career: 'Ingeniería Informática',
    });

    await expect(
      service.createSubject({
        code: 'INF-301',
        name: 'Ingeniería de Software',
        career: 'Ingeniería Informática',
      }),
    ).rejects.toThrow('El código ingresado ya existe en el sistema');
  });

  it('TC-CU09-04: rechaza el registro cuando el nombre tiene caracteres no permitidos', async () => {
    repository.findByCode.mockResolvedValue(null);

    await expect(
      service.createSubject({
        code: 'INF-301',
        name: 'Cálculo#1@',
        career: 'Ingeniería Informática',
      }),
    ).rejects.toThrow('Caracteres no permitidos');
  });
});
