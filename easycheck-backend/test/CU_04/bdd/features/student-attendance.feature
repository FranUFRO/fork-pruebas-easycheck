Feature: Consultar mi asistencia
  Como estudiante
  Quiero consultar mi asistencia por asignatura
  Para conocer mi avance academico

  Background:
    Given el repositorio de asistencia del estudiante se encuentra disponible

  @positive
  Scenario: Estudiante consulta una asignatura matriculada
    Given el estudiante autenticado esta matriculado en una asignatura
    When consulta su asistencia en la asignatura
    Then obtiene sus clases asistidas y el porcentaje

  @negative
  Scenario: Estudiante consulta una asignatura no matriculada
    Given el estudiante autenticado no esta matriculado en la asignatura
    When consulta su asistencia en la asignatura no matriculada
    Then el sistema rechaza la consulta por falta de matricula

  @negative
  Scenario: Estudiante inexistente consulta su asistencia
    Given no existe el estudiante autenticado
    When consulta su asistencia
    Then el sistema informa que el estudiante no existe

  @boundary
  Scenario: Estudiante sin clases obtiene porcentaje cero
    Given el estudiante esta matriculado pero no tiene clases registradas
    When consulta su asistencia en la asignatura sin clases
    Then obtiene un porcentaje de 0
