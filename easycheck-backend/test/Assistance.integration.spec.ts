/**
 * ============================================================
 *  EasyCheck — Integration Tests (Foro 7)
 *  Strategy: Bottom-Up
 *  Members: Francisca Neira, Ian Cicarelli
 * ============================================================
 *
 *  Level 3 — AssistanceService ↔ DataRepository (in-memory)
 *  Level 4 — AssistanceController ↔ AssistanceService (HTTP via supertest)
 *
 *  Covered cases:
 *   IT-1  Show student assistance      — success flow
 *   IT-2  Show student assistance      — student not found (404)
 *   IT-3  Verify assistance via QR     — successful registration (201)
 *   IT-4  Verify assistance via QR     — registration disabled (409)
 *   IT-5  Show subject assistance      — success flow (professor)
 *   IT-6  Show subject assistance      — professor without subject (404)
 * ============================================================
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AssistanceModule } from '../src/assistance/Assistance.module';
import { DataRepository } from '../src/assistance/Data.repository';

// ─── Typed response shapes (supertest exposes res.body as `any`) ───────────────

interface StudentAssistanceResponse {
  studentRut: string;
  subjectId: string;
  records: unknown[];
  totalClasses: number;
  classesAttended: number;
  assistancePercentage: number;
}

interface RegisterResponse {
  message: string;
  recordId: number;
  studentRut: string;
  classId: number;
}

interface SubjectStudentRow {
  rut: string;
  name: string;
  classesAttended: number;
  totalClasses: number;
  assistancePercentage: number;
}

interface ErrorResponse {
  error?: string;
  rut?: string;
  classId?: number;
  professorRut?: string;
  subjectCode?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildApp(): Promise<{
  app: INestApplication<App>;
  repo: DataRepository;
}> {
  return Test.createTestingModule({ imports: [AssistanceModule] })
    .compile()
    .then(async (moduleRef: TestingModule) => {
      const app = moduleRef.createNestApplication<INestApplication<App>>();
      await app.init();
      const repo = moduleRef.get<DataRepository>(DataRepository);
      return { app, repo };
    });
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('EasyCheck — Integration Tests (Bottom-Up)', () => {
  let app: INestApplication<App>;
  let repo: DataRepository;

  beforeAll(async () => {
    ({ app, repo } = await buildApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    repo.reset();
  });

  // ===========================================================================
  // IT-1 — Show student assistance: success flow
  // Integration: AssistanceController ↔ AssistanceService ↔ DataRepository
  // ===========================================================================
  describe('IT-1 — Show student assistance: success flow', () => {
    /**
     * Precondition:
     *  - DB contains student RUT 12345678-9 enrolled in ASG-01
     *  - 10 assistance records exist (all present)
     * Input: GET /api/v1/students/12345678-9/assistance?subject=ASG-01
     */
    it('should return HTTP 200 with 10 records and assistancePercentage', async () => {
      // ── Fixture (Level 1 — data in "DB") ──
      repo.seedStudent('12345678-9', 'Ana García');
      for (let i = 1; i <= 10; i++) {
        repo.seedAssistance({
          id: i,
          studentRut: '12345678-9',
          classId: i,
          subjectId: 'ASG-01',
          date: new Date(),
          present: true,
        });
      }

      // ── HTTP invocation (Level 4) ──
      const res = await request(app.getHttpServer())
        .get('/api/v1/students/12345678-9/assistance')
        .query({ subject: 'ASG-01' });
      const body = res.body as StudentAssistanceResponse;

      // ── Asserts ──
      expect(res.status).toBe(HttpStatus.OK);
      expect(body.studentRut).toBe('12345678-9');
      expect(body.subjectId).toBe('ASG-01');
      expect(body.records).toHaveLength(10);
      expect(body.assistancePercentage).toBe(100);
      expect(body).toHaveProperty('classesAttended');
      expect(body).toHaveProperty('totalClasses');

      // ── Assert on DB state ──
      const inDb = await repo.findAssistancesByStudentAndSubject(
        '12345678-9',
        'ASG-01',
      );
      expect(inDb).toHaveLength(10);
    });
  });

  // ===========================================================================
  // IT-2 — Show student assistance: student not found (404)
  // Integration: AssistanceController ↔ AssistanceService ↔ DataRepository
  // ===========================================================================
  describe('IT-2 — Show student assistance: student not found (404)', () => {
    /**
     * Precondition: DB does NOT contain RUT 1111111-1
     * Input: GET /api/v1/students/1111111-1/assistance?subject=ASG-01
     */
    it('should return HTTP 404 with error message and the involved rut', async () => {
      // No student is seeded — simulates a non-existent RUT

      const res = await request(app.getHttpServer())
        .get('/api/v1/students/1111111-1/assistance')
        .query({ subject: 'ASG-01' });
      const body = res.body as ErrorResponse;

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(body).toMatchObject({
        error: 'Student not found',
        rut: '1111111-1',
      });

      // ── Assert DB was not modified ──
      const inDb = await repo.findAssistancesByStudentAndSubject(
        '1111111-1',
        'ASG-01',
      );
      expect(inDb).toHaveLength(0);
    });
  });

  // ===========================================================================
  // IT-3 — Verify assistance via QR: successful registration (201)
  // Integration: AssistanceController ↔ AssistanceService ↔ DataRepository
  // ===========================================================================
  describe('IT-3 — Verify assistance via QR: successful registration', () => {
    /**
     * Precondition:
     *  - DB contains class id=42, ASG-01, status=ENABLED
     *  - Student 12345678-9 enrolled in ASG-01
     *  - No previous assistance record for that class
     * Input: POST /api/v1/assistance/register { valid qrSignature }
     */
    it('should return HTTP 201 with confirmation and insert the record in DB', async () => {
      // ── Fixture ──
      repo.seedStudent('12345678-9', 'Ana García');
      repo.seedEnrollment('12345678-9', 'ASG-01');
      repo.seedClass({
        id: 42,
        subjectId: 'ASG-01',
        date: new Date(),
        registrationStatus: 'ENABLED',
      });

      const payload = {
        studentRut: '12345678-9',
        classId: 42,
        subjectId: 'ASG-01',
        qrSignature: 'VALID_SIGNATURE_ABC123',
      };

      // ── HTTP invocation ──
      const res = await request(app.getHttpServer())
        .post('/api/v1/assistance/register')
        .send(payload);
      const body = res.body as RegisterResponse;

      // ── HTTP asserts ──
      expect(res.status).toBe(HttpStatus.CREATED);
      expect(body.message).toBe('Assistance registered successfully');
      expect(body.studentRut).toBe('12345678-9');
      expect(body.classId).toBe(42);
      expect(body).toHaveProperty('recordId');

      // ── Assert on DB state (side effect) ──
      const registered = await repo.assistanceExists('12345678-9', 42);
      expect(registered).toBe(true);
    });
  });

  // ===========================================================================
  // IT-4 — Verify assistance via QR: registration disabled (409)
  // Integration: AssistanceController ↔ AssistanceService ↔ DataRepository
  // ===========================================================================
  describe('IT-4 — Verify assistance via QR: registration disabled (409)', () => {
    /**
     * Precondition:
     *  - DB contains class id=55 with status=DISABLED
     *  - Student 12345678-9 enrolled
     * Input: POST /api/v1/assistance/register { classId: 55 }
     */
    it('should return HTTP 409 Conflict when class registration is disabled', async () => {
      repo.seedStudent('12345678-9', 'Ana García');
      repo.seedEnrollment('12345678-9', 'ASG-01');
      repo.seedClass({
        id: 55,
        subjectId: 'ASG-01',
        date: new Date(),
        registrationStatus: 'DISABLED',
      });

      const payload = {
        studentRut: '12345678-9',
        classId: 55,
        subjectId: 'ASG-01',
        qrSignature: 'VALID_SIGNATURE_ABC123',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/assistance/register')
        .send(payload);
      const body = res.body as ErrorResponse;

      // ── HTTP asserts ──
      expect(res.status).toBe(HttpStatus.CONFLICT);
      expect(body).toMatchObject({ classId: 55 });

      // ── Assert DB — no record was inserted ──
      const registered = await repo.assistanceExists('12345678-9', 55);
      expect(registered).toBe(false);
    });
  });

  // ===========================================================================
  // IT-5 — Show subject students assistance: success flow (professor)
  // Integration: AssistanceController ↔ AssistanceService ↔ DataRepository
  // ===========================================================================
  describe('IT-5 — Show subject students assistance: success flow', () => {
    /**
     * Precondition:
     *  - Professor 98765432-1 is assigned to INF-301
     *  - 3 enrolled students: RUT-A, RUT-B, RUT-C
     *  - 5 classes held with assistance for each student
     * Input: GET /api/v1/professors/98765432-1/subjects/INF-301/assistance
     */
    it('should return HTTP 200 with an array of 3 students with assistancePercentage', async () => {
      // ── Fixture ──
      repo.seedTeaching('98765432-1', 'INF-301');
      const students = [
        { rut: 'RUT-A', name: 'Carlos López' },
        { rut: 'RUT-B', name: 'María Pérez' },
        { rut: 'RUT-C', name: 'Juan Silva' },
      ];
      students.forEach((s) => {
        repo.seedStudent(s.rut, s.name);
        repo.seedEnrollment(s.rut, 'INF-301');
      });

      for (let i = 1; i <= 5; i++) {
        repo.seedClass({
          id: 100 + i,
          subjectId: 'INF-301',
          date: new Date(),
          registrationStatus: 'ENABLED',
        });
        students.forEach((s, idx) => {
          repo.seedAssistance({
            id: i * 10 + idx,
            studentRut: s.rut,
            classId: 100 + i,
            subjectId: 'INF-301',
            date: new Date(),
            present: true,
          });
        });
      }

      // ── HTTP invocation ──
      const res = await request(app.getHttpServer()).get(
        '/api/v1/professors/98765432-1/subjects/INF-301/assistance',
      );
      const body = res.body as SubjectStudentRow[];

      // ── Asserts ──
      expect(res.status).toBe(HttpStatus.OK);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(3);

      body.forEach((student) => {
        expect(student).toHaveProperty('rut');
        expect(student).toHaveProperty('name');
        expect(student).toHaveProperty('classesAttended');
        expect(student).toHaveProperty('assistancePercentage');
        expect(student.classesAttended).toBe(5);
        expect(student.assistancePercentage).toBe(100);
      });

      // ── Assert DB ──
      const assistance = await repo.findStudentsAssistanceBySubject('INF-301');
      expect(assistance).toHaveLength(3);
    });
  });

  // ===========================================================================
  // IT-6 — Show subject assistance: professor without subject (404)
  // Integration: AssistanceController ↔ AssistanceService ↔ DataRepository
  // ===========================================================================
  describe('IT-6 — Show subject assistance: professor without subject (404)', () => {
    /**
     * Precondition:
     *  - DB contains professor 11111111-1 but WITHOUT subject INF-999 assigned
     * Input: GET /api/v1/professors/11111111-1/subjects/INF-999/assistance
     */
    it('should return HTTP 404 when the professor is not assigned to the subject', async () => {
      // No teaching is seeded for this professor/subject

      const res = await request(app.getHttpServer()).get(
        '/api/v1/professors/11111111-1/subjects/INF-999/assistance',
      );
      const body = res.body as ErrorResponse;

      // ── Asserts ──
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(body).toMatchObject({
        professorRut: '11111111-1',
        subjectCode: 'INF-999',
      });
    });
  });
});
