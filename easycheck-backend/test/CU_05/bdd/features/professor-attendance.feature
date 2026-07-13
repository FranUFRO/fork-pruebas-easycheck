Feature: Consultar asistencia de una asignatura
  Como profesor
  Quiero consultar la asistencia de los estudiantes de mi asignatura
  Para hacer seguimiento del curso

  Background:
    Given el repositorio de asistencia del profesor se encuentra disponible

  @positive
  Scenario: Profesor consulta estudiantes de su asignatura
    Given el profesor imparte una asignatura con estudiantes
    When consulta la asistencia de la asignatura
    Then obtiene la lista de estudiantes y sus porcentajes

  @negative
  Scenario: Profesor consulta una asignatura que no imparte
    Given el profesor no imparte la asignatura consultada
    When consulta la asistencia de la asignatura no asignada
    Then el sistema rechaza la consulta del profesor

  @boundary
  Scenario: Profesor consulta una asignatura sin estudiantes
    Given el profesor imparte una asignatura sin estudiantes matriculados
    When consulta la asistencia de la asignatura vacia
    Then obtiene una lista de asistencia vacia

  @positive
  Scenario: Profesor obtiene el porcentaje de un estudiante ausente
    Given el profesor imparte una asignatura con un estudiante ausente
    When consulta la asistencia de la asignatura con inasistencia
    Then obtiene un porcentaje de asistencia de 0 para el estudiante
