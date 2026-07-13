Feature: Editar registro de asistencia
  Como profesor
  Quiero habilitar una ventana de edicion y corregir asistencias
  Para resolver errores sin reabrir el registro de estudiantes

  Background:
    Given el repositorio de edicion se encuentra disponible

  @positive
  Scenario: Profesor corrige asistencia durante la ventana de edicion
    Given la clase esta cerrada y tiene una asistencia registrada
    When el profesor habilita edicion y corrige la asistencia
    Then el registro cambia sin reabrir nuevos registros

  @negative
  Scenario: Profesor intenta editar mientras el registro esta abierto
    Given la clase mantiene el registro abierto
    When intenta habilitar la edicion
    Then el sistema exige cerrar primero el registro

  @negative
  Scenario: Profesor habilita una edicion ya habilitada
    Given la clase cerrada ya tiene la edicion habilitada
    When intenta habilitar nuevamente la edicion
    Then el sistema informa que la edicion ya estaba habilitada

  @negative
  Scenario: Profesor corrige una asistencia fuera de la ventana de edicion
    Given la clase esta cerrada pero la edicion esta deshabilitada
    When intenta corregir la asistencia
    Then el sistema rechaza la correccion por edicion deshabilitada

  @negative
  Scenario: Profesor corrige una asistencia de una asignatura ajena
    Given el profesor no imparte la asignatura del registro
    When intenta corregir la asistencia ajena
    Then el sistema rechaza la correccion por falta de asignacion

  @negative
  Scenario: Profesor corrige un registro inexistente
    Given no existe el registro de asistencia indicado
    When intenta corregir el registro inexistente
    Then el sistema informa que el registro no existe
