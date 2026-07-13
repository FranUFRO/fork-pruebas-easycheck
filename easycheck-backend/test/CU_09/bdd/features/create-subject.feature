Feature: Registrar una asignatura
  Como administrador
  Quiero registrar una asignatura local
  Para completar la oferta academica de EasyCheck

  Background:
    Given el repositorio de asignaturas se encuentra disponible

  @positive
  Scenario: Administrador registra una asignatura local
    Given no existe una asignatura con el codigo indicado
    When el administrador registra la nueva asignatura
    Then la asignatura queda almacenada con origen local

  @negative
  Scenario: Administrador registra una asignatura duplicada
    Given ya existe una asignatura con el codigo indicado
    When el administrador intenta registrar nuevamente la asignatura
    Then el sistema informa que el codigo ya existe

  @negative
  Scenario: Administrador registra una asignatura sin datos obligatorios
    When registra una asignatura con campos obligatorios vacios
    Then el sistema informa que faltan datos obligatorios

  @negative
  Scenario: Administrador registra una asignatura con caracteres invalidos
    When registra una asignatura con caracteres no permitidos
    Then el sistema rechaza el formato de la asignatura

  @boundary
  Scenario: Administrador registra una asignatura con espacios
    When registra una asignatura con espacios al inicio y al final
    Then el sistema normaliza los datos y conserva el origen local

  @security
  Scenario: Usuario sin token intenta registrar una asignatura
    When un usuario sin token intenta registrar una asignatura
    Then el sistema rechaza la solicitud con estado 401

  @security
  Scenario: Usuario sin rol administrador intenta registrar una asignatura
    When un usuario sin rol administrador intenta registrar una asignatura
    Then el sistema rechaza la solicitud con estado 403
