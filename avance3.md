# Avance 3 — Evaluación de cumplimiento de objetivos

**Proyecto:** EasyCheck — Backend (API de control de asistencia, UFRO)
**Fecha:** 2026-07-11
**Alcance de esta evaluación:** backend (`Easycheck-backend/easycheck-backend/`)
**Método:** auditoría del código y ejecución real de la suite de pruebas
(`npm run test:cov`) e inventario de artefactos del repositorio.

---

## 1. Objetivo

Completar la implementación funcional del **100% de los casos de uso priorizados**,
con una estrategia de calidad que incluya:

1. Cobertura mínima de **70%** de pruebas unitarias sobre el código de producción.
2. Pruebas de **integración** para todos los casos de uso.
3. Pruebas **E2E** para todos los casos de uso, cubriendo los flujos principales de usuario.
4. Pruebas de **carga y estrés** sobre todas las APIs relevantes, monitorizadas con **Grafana**.
5. Evaluación de **mantenibilidad, fiabilidad y seguridad** de todo el código con **SonarQube**.
6. **100% de los escenarios Gherkin** definidos, implementados y ejecutables (BDD: escenarios + glue/steps).

---

## 2. Resumen ejecutivo

| # | Objetivo | Estado |
|---|----------|--------|
| i | 100% de CU priorizados implementados | ✅ **Cumple** (9/9 endpoints; 2 son stubs) |
| 1 | Cobertura unitaria ≥ 70% | ✅ **Cumple** (87–88% líneas/statements) |
| 2 | Integración para **todos** los CU | ❌ **No cumple** (6/9) |
| 3 | E2E para **todos** los CU | ❌ **No cumple** (0/9 reales) |
| 4 | Carga/estrés + Grafana | ❌ **Ausente** |
| 5 | SonarQube (mant./fiab./seguridad) | 🟡 **Configurado, sin evidencia de ejecución** |
| 6 | 100% de escenarios Gherkin implementados y ejecutables | 🟡 **Sí, pero cubren solo 2/9 CU** |

**Leyenda:** ✅ cumple · 🟡 parcial · ❌ no cumple

---

## 3. Casos de uso priorizados

El sistema define **9 casos de uso** (CU-01 … CU-09), todos con endpoint operativo:

| CU | Descripción | Endpoint |
|----|-------------|----------|
| CU-01 | Inicio de sesión | `POST /api/v1/auth/login` |
| CU-02 | Registro de usuario | `POST /api/v1/users/register` |
| CU-03 | Asistencia de un estudiante (por RUT) | `GET /api/v1/students/:rut/attendance` |
| CU-04 | Asistencia del alumno en una asignatura | `GET /api/v1/students/:rut/assistance?subject=` |
| CU-05 | Asistencia de los alumnos de una asignatura | `GET /api/v1/professors/:rut/subjects/:code/assistance` |
| CU-06 | Registrar asistencia vía QR | `POST /api/v1/assistance/register` |
| CU-07 | Deshabilitar el registro de una clase | `PATCH /api/v1/professors/:rut/classes/:id/registration` |
| CU-08 | Habilitar el registro / editar una asistencia | `PATCH .../registration` y `PATCH .../assistance/:id` |
| CU-09 | Crear una asignatura | `POST /api/v1/subjects` |

> **Nota sobre "stubs":** CU-01 no valida la contraseña (cualquier valor no vacío
> es aceptado) y CU-06 acepta cualquier firma QR no vacía distinta de
> `INVALID_SIGNATURE`. Funcionalmente responden, pero no implementan la
> verificación real (pendiente de CU-01/JWT y de la firma criptográfica del QR).

---

## 4. Evaluación detallada por objetivo

### i) Implementación funcional de los CU — ✅ Cumple

Los 9 casos de uso tienen endpoint y responden con su contrato documentado.
Dos son *stubs* conscientes (login sin verificación de contraseña, QR sin firma
real). En sentido estricto, la funcionalidad "responde" en los 9, pero 2 no están
"completos" a nivel de verificación de seguridad.

### 1) Cobertura de pruebas unitarias ≥ 70% — ✅ Cumple con margen

Resultado real de `npm run test:cov` (ejecutado el 2026-07-11):

| Métrica | Valor | ¿≥70%? |
|---------|-------|:------:|
| Statements | **88.6%** (490/553) | ✅ |
| Branches | **71.13%** (175/246) | ✅ (ajustado) |
| Functions | **92.17%** (106/115) | ✅ |
| Lines | **87.69%** (442/504) | ✅ |

- **10 suites / 50 tests, todos verdes.** Tiempo ~8 s. No requiere Docker/Postgres
  (la app se cablea a repositorios en memoria sin `DB_HOST`).
- Las cuatro métricas superan el 70%. **`branches` (71.1%) es el punto frágil**:
  cualquier código nuevo con ramas sin probar puede bajarlo del umbral.
- Exclusiones de cobertura (config Sonar/Jest): `src/seed/**`, `src/database/**` y
  los adaptadores `*.typeorm*` (solo ejercitables contra Postgres real).

### 2) Pruebas de integración para todos los CU — ❌ No cumple (6/9)

Existe **un** archivo de integración: `test/Assistance.integration.spec.ts`
(casos IT-1 … IT-10), que cubre el módulo *assistance*:

| Caso | CU cubierto |
|------|-------------|
| IT-1, IT-2 | CU-04 (asistencia por asignatura: éxito / 404) |
| IT-3, IT-4 | CU-06 (QR: 201 / 409 registro deshabilitado) |
| IT-5, IT-6 | CU-05 (roster: éxito / profesor sin asignatura 404) |
| IT-7 | CU-03 (por RUT: 200 / 400 / 404) |
| IT-8 | CU-07 (deshabilitar: 200 / 404 / 409) |
| IT-9 | CU-08 (habilitar: 200 / 409) |
| IT-10 | CU-08 (editar asistencia: 200 / 404) |

**Faltan por completo:** **CU-01** (login), **CU-02** (registro de usuario),
**CU-09** (crear asignatura).

### 3) Pruebas E2E para todos los CU — ❌ No cumple (0/9 reales)

El único `*.e2e-spec.ts` es `test/app.e2e-spec.ts`, que prueba el scaffold por
defecto de NestJS (`GET /` → `"Hello World!"`). **No existe ningún E2E que
ejercite un flujo de usuario real de ningún caso de uso.** Es el hueco más grande
de la estrategia de calidad.

### 4) Pruebas de carga/estrés + Grafana — ❌ Ausente

No hay rastro de herramientas de carga (k6, Artillery, JMeter, Gatling) ni de
monitorización (Grafana, Prometheus) en ninguna parte del repositorio. El objetivo
está **sin iniciar**.

### 5) SonarQube (mantenibilidad, fiabilidad, seguridad) — 🟡 Parcial

- **Infraestructura lista:** existe `sonar-project.properties` (fuentes, tests,
  ruta del `coverage/lcov.info` combinado) y el flujo está documentado en el
  `README.md` (SonarQube por Docker en `:9000`, scanner unido a la red
  `easycheck-backend_sonar-network`).
- **Sin evidencia de ejecución/evaluación:** no hay en el repo un reporte ni
  quality gate que demuestre que el análisis se corrió y se evaluó.
- **Limitación de alcance:** la edición Community cubre bien *maintainability* y
  *reliability*; la dimensión de **seguridad** ("de todo el código") queda acotada
  a *security hotspots* básicos, sin SAST profundo.

### 6) 100% de escenarios Gherkin implementados y ejecutables — 🟡 Parcial

- **Los escenarios escritos sí están 100% implementados y pasan.** Hay **12
  escenarios** en dos features, con sus steps/glue y en verde
  (`npm run test:bdd`):
  - `test/BDD/features/Login.feature` (**CU-01**): 5 escenarios.
  - `test/BDD_CU_02/features/registro-usuario.feature` (**CU-02**): 7 escenarios.
- **Pero solo cubren 2 de 9 CU.** Los otros 7 casos de uso no tienen escenarios
  Gherkin definidos. Si el objetivo se interpreta como "escenarios definidos", se
  cumple; si se interpreta como "todos los CU con BDD", no.

---

## 5. Matriz de cobertura: CU × tipo de prueba

| CU | Unit (TDD) | Integración | E2E | BDD |
|----|:---------:|:-----------:|:---:|:---:|
| CU-01 Login | ❌ | ❌ | ❌ | ✅ |
| CU-02 Registro | ❌ | ❌ | ❌ | ✅ |
| CU-03 Asistencia por RUT | ✅ | ✅ | ❌ | ❌ |
| CU-04 Asistencia asignatura | ❌ | ✅ | ❌ | ❌ |
| CU-05 Roster asignatura | ❌ | ✅ | ❌ | ❌ |
| CU-06 Registro QR | ❌ | ✅ | ❌ | ❌ |
| CU-07 Deshabilitar registro | ✅ | ✅ | ❌ | ❌ |
| CU-08 Habilitar / editar | ✅ | ✅ | ❌ | ❌ |
| CU-09 Crear asignatura | ✅ | ❌ | ❌ | ❌ |

**Archivos de prueba (unit/TDD):** `test/TDD/Subject.unit.spec.ts`,
`test/TDD/SubjectAuth.unit.spec.ts` (CU-09), `test/TDD_CU_03/…`,
`test/TDD_CU_07/…`, `test/TDD_CU_08/…`.

---

## 6. Brechas y plan sugerido (por relación esfuerzo/impacto)

| Prioridad | Brecha | Acción | Esfuerzo |
|-----------|--------|--------|----------|
| 🔴 Alta | E2E de los 9 CU (0/9) | Implementar E2E reales con `supertest` + `app.init()` (reutilizar el patrón de `Assistance.integration.spec.ts`) | Medio |
| 🔴 Alta | Carga/estrés + Grafana (ausente) | Montar k6 (o Artillery) exportando a Prometheus + dashboard Grafana sobre los endpoints clave | Medio-alto (infra nueva) |
| 🟠 Media | Integración de CU-01, CU-02, CU-09 | Añadir specs de integración para login, registro y crear asignatura | Bajo |
| 🟠 Media | Gherkin de los 7 CU restantes | Escribir features + steps para CU-03…CU-09 | Medio |
| 🟡 Baja | SonarQube sin evidencia | Ejecutar el scanner y adjuntar el resultado del quality gate | Bajo |
| 🟡 Baja | `branches` al límite (71.1%) | Reforzar tests de ramas para no caer bajo 70% al crecer el código | Bajo |

---

## 7. Cómo reproducir estas métricas

```bash
cd Easycheck-backend/easycheck-backend
npm install
npm run test:cov      # 10 suites / 50 tests + resumen de cobertura
npm run test:bdd      # solo BDD (12 escenarios Gherkin)
npm run test:integration
npm run test:e2e      # actualmente solo el scaffold Hello World
```

---

*Documento generado como Avance 3 a partir de la auditoría del backend. Los frontends
(web y móvil) no forman parte de esta evaluación de calidad de API.*
