# Easycheck-backend

API REST de control de asistencia a clases (UFRO), hecha con NestJS.
Guía rápida para levantar el proyecto y probar los endpoints.

> **Ojo con las rutas:** el repo git es `Easycheck-backend/`, pero el proyecto
> Nest vive un nivel más abajo en `easycheck-backend/`. Los comandos `npm` se
> corren desde ahí; los `docker compose`, desde la raíz del repo.

---

## 1) Arranque con Docker (recomendado)

Levanta todo el stack con un solo comando: **Postgres + backend + datos de
demo**. El `docker-compose.yml` construye el Dockerfile del backend, arranca
Postgres 16 y siembra datos automáticamente al iniciar.

```bash
# 1. Ubicarse en la raíz del repo (donde está docker-compose.yml)
cd Easycheck-backend

# 2. Construir y levantar (Postgres + backend + seed automático)
docker compose up --build

# 3. Listo. La API queda en:
#    http://localhost:3000            → API
#    http://localhost:3000/api/docs   → Swagger (probar endpoints desde el navegador)

# 4. Si cambiaste entidades/modelo, regenera el esquema desde cero:
docker compose down -v && docker compose up --build
```

- Postgres queda en `localhost:5433` (el 5432 suele estar ocupado por un
  Postgres local). Credenciales de la base (solo dev): usuario `easycheck`,
  contraseña `easycheck_dev`, base `easycheck`.
- El seed es **idempotente**: si la base ya tiene datos, no los duplica.

---

## 2) Arranque sin Docker (modo en memoria)

Sin la variable `DB_HOST`, el backend corre con repositorios **en memoria** (no
necesita Postgres). Es el mismo modo que usan las pruebas.

```bash
# 1. Entrar al proyecto Nest (un nivel más abajo del repo)
cd easycheck-backend

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor en modo watch (puerto 3000)
npm run start:dev

# 4. Probar en el navegador:
#    http://localhost:3000/api/docs   → Swagger

# 5. (Opcional) correr todas las pruebas — no requieren Docker ni Postgres
npm test
```

En este modo los datos viven en memoria y se reinician al reiniciar el servidor.

---

## Endpoints por caso de uso

Todas las rutas cuelgan del prefijo `api/v1` y la base es
`http://localhost:3000`. Los RUT de demo vienen del seed (solo modo Docker).

**Usuarios de login (seed):** la contraseña aún no se valida, cualquier valor no
vacío sirve.

| RUT | Rol | Estado |
|-----|-----|--------|
| `11111111-1` | estudiante | activo |
| `22222222-2` | profesor | activo |
| `33333333-3` | director | activo |
| `44444444-4` | administrador | activo |
| `77777777-7` | estudiante | **deshabilitado** (para probar el 403) |

> **Nota sobre permisos:** algunos endpoints están protegidos por rol. Como aún
> no hay login con token real, el rol se envía con el header `x-user-role`
> (más un header `authorization` con cualquier valor). Es un atajo de
> desarrollo.

---

### CU-01 · Inicio de sesión
- **Endpoint:** `POST http://localhost:3000/api/v1/auth/login`
- **Credenciales:** RUT del seed + cualquier contraseña no vacía.
- **Recibe:** `{ "rut": "11111111-1", "password": "demo" }`
- **Entrega:** `200` con los datos del usuario. Con `77777777-7` → `403` (cuenta deshabilitada).

### CU-02 · Registro de usuario
- **Endpoint:** `POST http://localhost:3000/api/v1/users/register`
- **Credenciales:** ninguna. El RUT institucional conocido por el stub es `12345678-9`.
- **Recibe:** `{ "rut", "institutionalEmail", "institutionalPassword", "fullName", "role" }`
- **Entrega:** `201` con el usuario creado.

### CU-03 · Asistencia de un estudiante (por RUT)
- **Endpoint:** `GET http://localhost:3000/api/v1/students/:rut/attendance`
- **Credenciales:** header `x-user-role: director` o `administrador`.
- **Recibe:** el RUT en la URL (ej. `11111111-1`).
- **Entrega:** asistencia agrupada por asignatura: `[{ subjectName, attendedClasses, totalClasses, attendancePercentage }]`. RUT inválido → `400`, estudiante inexistente → `404`.

### CU-04 · Asistencia del alumno en una asignatura
- **Endpoint:** `GET http://localhost:3000/api/v1/students/:rut/assistance?subject=ICC-101`
- **Credenciales:** ninguna.
- **Recibe:** RUT en la URL + `subject` como query.
- **Entrega:** el porcentaje de asistencia de ese alumno en la asignatura.

### CU-05 · Asistencia de los alumnos de una asignatura
- **Endpoint:** `GET http://localhost:3000/api/v1/professors/:rut/subjects/:code/assistance`
- **Credenciales:** ninguna.
- **Recibe:** RUT del profesor y código de asignatura en la URL (ej. `22222222-2`, `ICC-101`).
- **Entrega:** lista de estudiantes con su asistencia. Profesor sin esa asignatura → `404`.

### CU-06 · Registrar asistencia vía QR
- **Endpoint:** `POST http://localhost:3000/api/v1/assistance/register`
- **Credenciales:** ninguna.
- **Recibe:** `{ "studentRut", "classId", "subjectId", "qrSignature" }`
- **Entrega:** `201` al registrar. Si la clase tiene el registro deshabilitado (ej. `classId` 2) → `409`.

### CU-07 · Deshabilitar el registro de una clase
- **Endpoint:** `PATCH http://localhost:3000/api/v1/professors/:rut/classes/:id/registration`
- **Credenciales:** ninguna.
- **Recibe:** `{ "status": "DISABLED" }`
- **Entrega:** `200`. Si ya estaba deshabilitado → `409`.

### CU-08 · Habilitar el registro / editar una asistencia
- **Endpoints:**
  - `PATCH http://localhost:3000/api/v1/professors/:rut/classes/:id/registration` → recibe `{ "status": "ENABLED" }`
  - `PATCH http://localhost:3000/api/v1/professors/:rut/assistance/:id` → recibe `{ "present": true }`
- **Credenciales:** ninguna.
- **Entrega:** `200`. Registro inexistente → `404`, `present` no booleano → `400`.

### CU-09 · Crear una asignatura
- **Endpoint:** `POST http://localhost:3000/api/v1/subjects`
- **Credenciales:** header `x-user-role: administrador`.
- **Recibe:** `{ "code", "name", "career" }` (ej. `ICC-404`, `Sistemas Operativos`, `ICINF`).
- **Entrega:** `201`. Código duplicado → `409`, datos inválidos → `400`.

---

## 3) SonarQube (análisis de calidad)

SonarQube corre con Docker, aparte del stack de la app. Primero se necesita
tenerlo **levantado** y crear el proyecto para obtener un token.

```bash
# 1. Levantar SonarQube (accesible en http://localhost:9000; usuario/clave: admin / admin)
docker compose up -d sonarqube

# 2. En http://localhost:9000 crear el proyecto "easycheck-backend" y generar su token.

# 3. Generar la cobertura de tests (desde el proyecto Nest)
cd easycheck-backend
npm run test:cov

# 4. Correr el scanner (desde easycheck-backend/, usa sonar-project.properties)
docker run --rm \
  --network easycheck-backend_sonar-network \
  -v "$(pwd):/usr/src" -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.token=TU_TOKEN
```

- El scanner debe unirse a la red `easycheck-backend_sonar-network` (Compose le
  antepone el nombre del proyecto).
- La configuración (fuentes, tests, ruta del `lcov`) vive en
  `easycheck-backend/sonar-project.properties`; por eso el scanner se corre
  **desde `easycheck-backend/`** y solo hace falta pasarle el host y el token.

---

## Comandos útiles

```bash
# Desde easycheck-backend/
npm run start:dev          # servidor en modo watch
npm run build              # compilar a dist/
npm test                   # todas las pruebas (unit + integration + e2e + bdd + tdd)
npm run test:cov           # pruebas + reporte de cobertura combinado
npm run lint               # eslint --fix
```
