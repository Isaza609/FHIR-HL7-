# Consistencia de datos (RNF-03)

## Regla

Un **Slot** con `status = busy` **no** debe asociarse a un nuevo **Appointment** activo. Un Slot solo puede estar vinculado a un Appointment en estado `booked` a la vez.

## Comportamiento esperado ante doble reserva

Si un cliente (cualquier canal) intenta crear un `Appointment` que referencia un Slot que ya tiene `status = busy`:

1. El sistema debe **rechazar** la operación (p. ej. HTTP 409 Conflict o validación previa).
2. Alternativamente: validar antes de crear el Appointment que el Slot sigue en `free`; si no, devolver error explicativo.

Documentar en pruebas: intento de crear dos Appointments sobre el mismo Slot y verificación del rechazo o validación.
