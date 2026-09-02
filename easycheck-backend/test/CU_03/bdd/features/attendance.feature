Feature: Consultar asistencia de un estudiante
  Como director
  Quiero consultar la asistencia de un estudiante mediante su RUT
  Para supervisar su cumplimiento academico

  Background:
    Given el repositorio de asistencia se encuentra disponible

  @positive
  Scenario: Director consulta la asistencia por RUT
    Given existe un estudiante matriculado con una clase asistida de dos
    When el director consulta la asistencia del estudiante
    Then obtiene un porcentaje de asistencia de 50

  @negative
  Scenario: Director consulta un RUT con formato invalido
    When el director consulta la asistencia con un RUT invalido
    Then el sistema rechaza la consulta por formato de RUT

  @negative
  Scenario: Director consulta un estudiante inexistente
    Given no existe un estudiante con el RUT consultado
    When el director consulta la asistencia del estudiante inexistente
    Then el sistema informa que el estudiante no existe

  @boundary
  Scenario: Estudiante sin clases registra porcentaje cero
    Given existe un estudiante matriculado sin clases registradas
    When el director consulta la asistencia del estudiante sin clases
    Then obtiene un porcentaje de asistencia de 0
