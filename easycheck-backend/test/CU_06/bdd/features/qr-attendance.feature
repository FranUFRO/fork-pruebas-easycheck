Feature: Registrar asistencia mediante QR
  Como estudiante
  Quiero generar un QR firmado para que el lector registre mi asistencia
  Para acreditar mi presencia en una clase

  Background:
    Given el repositorio de QR se encuentra disponible

  @positive
  Scenario: Estudiante genera QR y el lector registra asistencia
    Given el estudiante esta matriculado en una clase habilitada
    When genera su QR y el lector lo valida
    Then la asistencia queda registrada una sola vez

  @negative
  Scenario: El QR alterado es rechazado
    Given el estudiante esta matriculado en una clase habilitada
    When el lector intenta validar un QR alterado
    Then el sistema rechaza el QR por firma invalida

  @negative
  Scenario: No se genera QR para una clase cerrada
    Given el estudiante esta matriculado en una clase cerrada
    When intenta generar su QR
    Then el sistema informa que el registro esta cerrado

  @negative
  Scenario: No se genera QR para un estudiante no matriculado
    Given el estudiante no esta matriculado en la asignatura de la clase
    When intenta generar su QR
    Then el sistema rechaza la generacion por falta de matricula

  @negative
  Scenario: No se registra un QR dos veces
    Given existe un QR valido ya utilizado para la clase
    When el lector intenta reutilizar el mismo QR
    Then el sistema rechaza el registro duplicado

  @negative
  Scenario: No se genera QR para una clase inexistente
    Given no existe la clase solicitada
    When intenta generar su QR
    Then el sistema informa que la clase no existe
