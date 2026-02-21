# RF-07 – Agendamiento de Cita

**Objetivo:** Registrar una cita médica y reservar el espacio correspondiente.

---

## Tarea 1 – Crear recurso Appointment

Se creó un recurso `Appointment` de ejemplo que registra una cita médica con el Slot seleccionado, el paciente, el profesional y el tipo de servicio.

### Ubicación del recurso

| Archivo | Id del recurso |
|---------|----------------|
| `fhir_resources/Appointment/appt-ejemplo.json` | `appt-ejemplo` |

### Campos implementados

El `Appointment` incluye:

| Campo         | Presente | Descripción |
|---------------|----------|-------------|
| `id`          | Sí       | Identificador único (convención `appt-*`) |
| `status`      | Sí       | `booked` (cita reservada) |
| `start`       | Sí       | Inicio de la cita en ISO 8601 (debe coincidir con el Slot) |
| `end`         | Sí       | Fin de la cita en ISO 8601 |
| `participant`  | Sí       | Incluye `Patient` (pat-ejemplo-001) y `PractitionerRole` (pr-casas-pediatria-norte); `required` y `status: accepted` |
| `serviceType` | Sí       | Tipo de servicio (ej. Control - Pediatría, code 57) |
| `slot`        | Sí       | Referencia al `Slot` reservado (slot-pediatria-001) |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Relación con el Slot

El Appointment referencia **Slot/slot-pediatria-001** (08:00–08:30 del 2025-02-19). Las fechas `start` y `end` del Appointment coinciden con las del Slot.

### Cómo cargar en el servidor

El Appointment depende de Patient, PractitionerRole y Slot. Cargar después de ellos. Sustituir `BASE_URL` por la URL del servidor (ej. `http://hapi.fhir.org/baseR4`).

**Bash / Linux (curl):**
```bash
curl -X PUT "BASE_URL/Appointment/appt-ejemplo" -H "Content-Type: application/fhir+json" -d @fhir_resources/Appointment/appt-ejemplo.json
```

**PowerShell (Windows):** En PowerShell `curl` es un alias de `Invoke-WebRequest` y no acepta `-H` ni `-d`. Usar `Invoke-RestMethod`:

```powershell
$baseUrl = "http://hapi.fhir.org/baseR4"
$body = Get-Content -Path "fhir_resources/Appointment/appt-ejemplo.json" -Raw
Invoke-RestMethod -Uri "$baseUrl/Appointment/appt-ejemplo" -Method Put -Body $body -ContentType "application/fhir+json"
```

El script `scripts/cargar_recursos.py` no incluye Appointment/AppointmentResponse por defecto (se crean en el flujo de agendamiento); cargarlos manualmente si se desea el ejemplo en el servidor.

---

## Tarea 2 – Actualizar Slot a busy y crear AppointmentResponse

Al agendar una cita deben cumplirse dos pasos adicionales: (1) actualizar el **Slot** asociado a **status = busy** para que no se ofrezca de nuevo, y (2) generar un **AppointmentResponse** como confirmación al paciente.

### Actualizar Slot.status a busy

Cuando se reserva un Slot mediante un Appointment, el recurso Slot debe actualizarse a **status = busy**. En el repositorio, el archivo `fhir_resources/Slot/slot-pediatria-001.json` se mantiene en estado **free** (estado inicial antes de la reserva). En el servidor, tras crear el Appointment, debe actualizarse el Slot.

**Ejemplo con PUT** (sustituir `BASE_URL`):

1. Obtener el Slot actual (opcional, para no perder otros campos):
   ```http
   GET BASE_URL/Slot/slot-pediatria-001
   ```
2. Enviar el mismo recurso con `"status": "busy"`:

   **Bash:** Editar localmente el JSON poniendo `"status":"busy"` y luego:
   ```bash
   curl -X PUT "BASE_URL/Slot/slot-pediatria-001" -H "Content-Type: application/fhir+json" -d @fhir_resources/Slot/slot-pediatria-001.json
   ```

   **PowerShell:**
   ```powershell
   $baseUrl = "http://hapi.fhir.org/baseR4"
   $body = Get-Content -Path "fhir_resources/Slot/slot-pediatria-001.json" -Raw
   # Editar $body para que "status" sea "busy", o usar el JSON mínimo siguiente:
   $body = '{"resourceType":"Slot","id":"slot-pediatria-001","schedule":{"reference":"Schedule/sched-pr-casas-2025-02"},"status":"busy","start":"2025-02-19T08:00:00-05:00","end":"2025-02-19T08:30:00-05:00"}'
   Invoke-RestMethod -Uri "$baseUrl/Slot/slot-pediatria-001" -Method Put -Body $body -ContentType "application/fhir+json"
   ```

**Flujo completo de agendamiento:** Crear Appointment → Actualizar Slot a busy → Crear AppointmentResponse.

### Recurso AppointmentResponse

Se creó un recurso `AppointmentResponse` que confirma la cita al paciente.

### Ubicación del recurso

| Archivo | Id del recurso |
|---------|----------------|
| `fhir_resources/AppointmentResponse/apptresp-ejemplo.json` | `apptresp-ejemplo` |

### Campos implementados

El `AppointmentResponse` incluye:

| Campo              | Presente | Descripción |
|--------------------|----------|-------------|
| `appointment`       | Sí       | Referencia al `Appointment` (appt-ejemplo) |
| `actor`            | Sí       | Referencia al `Patient` (pat-ejemplo-001) que recibe la confirmación |
| `participantStatus`| Sí       | `accepted` (paciente acepta la cita) |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Cómo cargar en el servidor

Cargar después del Appointment:

**Bash:**
```bash
curl -X PUT "BASE_URL/AppointmentResponse/apptresp-ejemplo" -H "Content-Type: application/fhir+json" -d @fhir_resources/AppointmentResponse/apptresp-ejemplo.json
```

**PowerShell:**
```powershell
$baseUrl = "http://hapi.fhir.org/baseR4"
$body = Get-Content -Path "fhir_resources/AppointmentResponse/apptresp-ejemplo.json" -Raw
Invoke-RestMethod -Uri "$baseUrl/AppointmentResponse/apptresp-ejemplo" -Method Put -Body $body -ContentType "application/fhir+json"
```

### Resumen del flujo RF-07

| Paso | Acción | Recurso |
|------|--------|---------|
| 1 | Crear cita | Appointment (status=booked, participant Patient + PractitionerRole, slot, start, end, serviceType) |
| 2 | Reservar espacio | Actualizar Slot referenciado: status → **busy** |
| 3 | Confirmar al paciente | AppointmentResponse (appointment, actor=Patient, participantStatus=accepted) |

### Cómo verificar

1. **Consultar el Appointment:**
   ```http
   GET BASE_URL/Appointment/appt-ejemplo
   ```
   Comprobar `status=booked`, `slot`, `participant` (Patient y PractitionerRole), `start`/`end`.

2. **Consultar el Slot** (tras actualizarlo a busy):
   ```http
   GET BASE_URL/Slot/slot-pediatria-001
   ```
   Comprobar `status=busy`.

3. **Consultar el AppointmentResponse:**
   ```http
   GET BASE_URL/AppointmentResponse/apptresp-ejemplo
   ```
   Comprobar `appointment`, `actor` (Patient), `participantStatus=accepted`.

---

## Resumen de cumplimiento RF-07

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear Appointment con id, status=booked, start, end, participant (Patient y PractitionerRole), serviceType, slot | Cumplida | `fhir_resources/Appointment/appt-ejemplo.json` |
| Tarea 2 – Actualizar Slot a busy y crear AppointmentResponse (appointment, actor=Patient, participantStatus=accepted) | Cumplida | Flujo documentado; Slot se actualiza en servidor; `fhir_resources/AppointmentResponse/apptresp-ejemplo.json` |
