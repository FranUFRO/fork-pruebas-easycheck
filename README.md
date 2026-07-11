# Easycheck-backend
Backend para easycheck creado con Nest

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar servidor

```bash
npm run start:dev
```

## Scripts

```bash
npm run start
npm run start:dev
npm run build
npm run test
```

## Test
```bash

Integracion 
npm run test:integration

BDD
npm run test:bdd
```


## Escenarios 

1. CU-01 BDD Pasar a Nest / Pruebas de Humo / Ian
2. CU-02 BDD Fran
3. CU-03 TDD (con endpoint HTTP expuesto) Fran
4. CU-04 Pruebas de Humo / Hacer pruebas unitarias Ian 
5. CU-05 Pruebas de Humo / Hacer pruebas unitarias Fran
6. CU-06 Pruebas de Humo / Hacer pruebas unitarias
7. CU-07 TDD + Integración
8. CU-08 TDD + Integración
9. CU-09 TDD /Ian

## Foro 8 SonarQube

Pruebas2026@
token Analyze "easycheck-backend": sqp_508efdee148448400f630e9f737e2b95581e3d59 

1. Levantar docker

```bash
docker network create sonar-network

docker run -d \
  --name sonarqube \
  --network sonar-network \
  -p 9000:9000 \
  sonarqube:community
```
2.  Crear el proyecto en http://localhost:9000 y obtener su propio token 

Recordar que la clave y nombre de usuario es admin.

a modo de ejemplo de clave nueva y token generado

Pruebas2026@
token Analyze "easycheck-backend": sqp_508efdee148448400f630e9f737e2b95581e3d59 

3. Generar cobertura 

```bash
cd ~/ruta/del/proyecto/easycheck-backend
npm run test:cov
```
4. Correr el scanner con su propio token

La configuración vive en `easycheck-backend/sonar-project.properties` (sources,
tests y la ruta del lcov combinado). Por eso el scanner se ejecuta **desde
`easycheck-backend/`** y sólo hace falta pasarle el host y el token:

```bash
cd ~/ruta/del/proyecto/Easycheck-backend/easycheck-backend

docker run \
  --rm \
  --network sonar-network \
  -v "$(pwd):/usr/src" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.token=TOKEN_DE
```

### Con docker compose 

1. Comando docker compose up -d
2. Cobertura npm run test:cov
3. Ejecutar (desde `easycheck-backend/`, usa el `sonar-project.properties`).

```bash
docker run \
  --rm \
  --network easycheck-backend_sonar-network \
  -v "$(pwd):/usr/src" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.token=sqp_508efdee148448400f630e9f737e2b95581e3d59 
  ```