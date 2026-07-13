Feature: Cerrar registro de asistencia
  Como profesor
  Quiero cerrar el registro de una clase
  Para impedir nuevos registros mediante QR

  Background:
    Given el repositorio de clases se encuentra disponible

  @positive
  Scenario: Profesor cierra nuevos registros de su clase
    Given el profesor imparte una clase con registro habilitado
    When cierra el registro de asistencia
    Then la clase deja de aceptar nuevos registros

  @negative
  Scenario: Profesor cierra una clase ya cerrada
    Given el profesor imparte una clase con registro ya cerrado
    When intenta cerrar nuevamente el registro
    Then el sistema informa que el registro ya estaba cerrado

  @negative
  Scenario: Profesor cierra una clase que no imparte
    Given el profesor no imparte la asignatura de la clase
    When intenta cerrar el registro de la clase no asignada
    Then el sistema rechaza la operacion por falta de asignacion

  @negative
  Scenario: Profesor cierra una clase inexistente
    Given no existe la clase que se desea cerrar
    When intenta cerrar el registro de la clase inexistente
    Then el sistema informa que la clase no existe
