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
