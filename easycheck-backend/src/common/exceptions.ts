export class StudentNotFoundException extends Error {
  constructor(public readonly rut: string) {
    super(`Student ${rut} not found`);
    this.name = 'StudentNotFoundException';
  }
}

export class SubjectNotAssignedException extends Error {
  constructor(
    public readonly professorRut: string,
    public readonly subjectCode: string,
  ) {
    super(
      `Subject ${subjectCode} is not assigned to professor ${professorRut}`,
    );
    this.name = 'SubjectNotAssignedException';
  }
}

export class RegistrationDisabledException extends Error {
  constructor(public readonly classId: number) {
    super(`Registration for class ${classId} is disabled`);
    this.name = 'RegistrationDisabledException';
  }
}

export class DuplicateAssistanceException extends Error {
  constructor(
    public readonly studentRut: string,
    public readonly classId: number,
  ) {
    super(
      `Student ${studentRut} already registered assistance for class ${classId}`,
    );
    this.name = 'DuplicateAssistanceException';
  }
}

export class InvalidQRException extends Error {
  constructor() {
    super('Invalid QR signature');
    this.name = 'InvalidQRException';
  }
}

export class EmptyCredentialsException extends Error {
  constructor(public readonly fields: string[]) {
    super('Debe completar los campos obligatorios');
    this.name = 'EmptyCredentialsException';
  }
}

export class InvalidRutFormatException extends Error {
  constructor(public readonly rut: string) {
    super('El formato del RUT ingresado no es válido');
    this.name = 'InvalidRutFormatException';
  }
}

export class AccountDisabledException extends Error {
  constructor(public readonly rut: string) {
    super('Su cuenta se encuentra deshabilitada, contacte al administrador');
    this.name = 'AccountDisabledException';
  }
}

export class InvalidCredentialsException extends Error {
  constructor() {
    super('RUT o contraseña incorrectos');
    this.name = 'InvalidCredentialsException';
  }
}

export class SubjectAlreadyExistsException extends Error {
  constructor(public readonly code: string) {
    super('El código ingresado ya existe en el sistema');
    this.name = 'SubjectAlreadyExistsException';
  }
}

export class MissingFieldsException extends Error {
  constructor(public readonly fields: string[]) {
    super('Debe completar los datos obligatorios');
    this.name = 'MissingFieldsException';
  }
}

export class InvalidFieldFormatException extends Error {
  constructor(public readonly field: string) {
    super('Caracteres no permitidos');
    this.name = 'InvalidFieldFormatException';
  }
}
