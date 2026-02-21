# RF-08 – Cancelación de Cita

**Objetivo:** Permitir la cancelación de una cita existente.

---

## Tarea 1 – Actualizar Appointment (status = cancelled, cancelationReason)

Cuando un paciente o la institución cancela una cita, el recurso `Appointment` debe actualizarse: **status** a `cancelled` y **cancelationReason** con el motivo de la cancelación.

### Recurso de ejemplo en estado cancelado

Se dispone de un ejemplo que muestra el estado del Appointment **después** de la cancelación (mismo id que la cita reservada):

| Archivo | Id del recurso | Uso |
|---------|----------------|-----|
| `fhir_resources/Appointment/appt-ejemplo.json` | appt-ejemplo | Estado **booked** (antes de cancelar) |
| `fhir_resources/Appointment/appt-ejemplo-cancelado.json` | appt-ejemplo | Estado **cancelled** (después de cancelar) |

### Campos actualizados en la cancelación

| Campo                | Antes   | Después    |
|----------------------|---------|------------|
| `status`             | `booked`| `cancelled`|
| `cancelationReason`   | (ausente) | CodeableConcept con motivo (ej. Patient, código `pat`) |

En el ejemplo cancelado se usa el motivo **Patient** (`pat`) del value set [appointment-cancellation-reason](http://hl7.org/fhir/R4/valueset-appointment-cancellation-reason.html) (cancelación iniciada por el paciente).

### Cómo actualizar en el servidor

Opción 1: **PUT** con el recurso completo en estado cancelado:

```bash
# Sustituir BASE_URL por la URL del servidor
curl -X PUT "BASE_URL/Appointment/appt-ejemplo" -H "Content-Type: application/fhir+json" -d @fhir_resources/Appointment/appt-ejemplo-cancelado.json
```

Opción 2: Obtener el Appointment actual (GET), cambiar en el JSON `status` a `cancelled` y añadir `cancellationReason`, y enviar PUT con ese cuerpo.

---

## Tarea 2 – Actualizar el Slot asociado (status = free)

Al cancelar la cita, el **Slot** que estaba reservado debe volver a estar disponible: **status** de `busy` a `free`.

### Cambio de estado del Slot

| Campo   | Antes (cita reservada) | Después (cita cancelada) |
|---------|------------------------|---------------------------|
| `status` | `busy`                 | `free`                    |

El Slot asociado al Appointment de ejemplo es **slot-pediatria-001**. Tras la cancelación, ese Slot debe actualizarse a `status: "free"` para que vuelva a aparecer en consultas de disponibilidad (RF-06).

### Cómo actualizar en el servidor

Obtener el Slot, cambiar `status` a `free` y enviar PUT:

```bash
curl -X PUT "BASE_URL/Slot/slot-pediatria-001" -H "Content-Type: application/fhir+json" -d "{\"resourceType\":\"Slot\",\"id\":\"slot-pediatria-001\",\"schedule\":{\"reference\":\"Schedule/sched-pr-casas-2025-02\"},\"status\":\"free\",\"start\":\"2025-02-19T08:00:00-05:00\",\"end\":\"2025-02-19T08:30:00-05:00\"}"
```

O usar el archivo `fhir_resources/Slot/slot-pediatria-001.json` (ya tiene `status: "free"`) si el Slot en el servidor tiene el mismo contenido.

---

## Cambio de estados antes y después (resumen)

Flujo completo: **cita reservada** → **cancelación** → **estados actualizados**.

### Appointment

| Recurso   | Campo              | Antes      | Después     |
|-----------|--------------------|------------|-------------|
| Appointment (appt-ejemplo) | status             | booked     | cancelled   |
| Appointment (appt-ejemplo) | cancelationReason | (no presente) | Presente (ej. Patient) |

### Slot

| Recurso   | Campo  | Antes | Después |
|-----------|--------|-------|---------|
| Slot (slot-pediatria-001) | status | busy  | free     |

### Orden recomendado al cancelar

1. Actualizar el **Appointment**: `status = cancelled` y `cancelationReason`.
2. Actualizar el **Slot** asociado: `status = free`.

Así se mantiene la coherencia con RNF-04 (integridad de estados): un Slot libre no debe estar referenciado por un Appointment activo (booked), y un Appointment cancelado debe liberar el Slot.

### Cómo verificar

1. **Appointment cancelado:**  
   `GET BASE_URL/Appointment/appt-ejemplo` → `resource.status` debe ser `cancelled` y debe existir `resource.cancelationReason`.

2. **Slot liberado:**  
   `GET BASE_URL/Slot/slot-pediatria-001` → `resource.status` debe ser `free`.

3. **Consulta de disponibilidad:**  
   Ejecutar el script de RF-06; el Slot slot-pediatria-001 debe aparecer entre los libres si se consulta el Schedule correspondiente.

---

## Resumen de cumplimiento RF-08

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Actualizar Appointment: status=cancelled, cancelationReason | Cumplida | Flujo documentado; ejemplo en `appt-ejemplo-cancelado.json` |
| Tarea 2 – Actualizar Slot asociado: status=free; documentar cambio de estados | Cumplida | Flujo documentado; tabla antes/después en esta sección |
