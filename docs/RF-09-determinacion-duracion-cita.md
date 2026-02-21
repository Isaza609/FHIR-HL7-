# RF-09 – Determinación de Duración de Cita

**Objetivo:** Aplicar la tabla de tiempos según aseguradora y tipo de consulta.

---

## Tarea 1 – Matriz de reglas (tipo de consulta × aseguradora → duración)

La duración de cada cita (y por tanto del `Slot` que la representa) se determina por dos criterios: **tipo de consulta** y **aseguradora del paciente**. La aseguradora se obtiene del recurso **Coverage** del paciente (`Coverage.payor` → Organization).

### Matriz de duración (minutos)

Según el documento de contexto y la configuración del proyecto:

| Tipo de consulta | Salud Cooperativa | Salud Completa |
|------------------|-------------------|-----------------|
| Primera vez – Medicina general | 30 | 45 |
| Primera vez – Consulta especializada | 45 | 60 |
| Control – Medicina general | 20 | 30 |
| Control – Consulta especializada | 30 | 45 |
| Control – Telemedicina (Medicina general) | 15 | 25 |
| Control – Telemedicina (Consulta especializada) | 20 | 30 |

### Ubicación de la configuración

La matriz se mantiene en **`config/duracion-citas.json`**, con identificadores de aseguradoras y claves de tipo de consulta alineadas al escenario:

- **Aseguradoras:** `Salud-Cooperativa` → `org-aseguradora-salud-cooperativa`, `Salud-Completa` → `org-aseguradora-salud-completa`.
- **Tipos de consulta:** `primera-vez-medicina-general`, `primera-vez-especializada`, `control-medicina-general`, `control-especializada`, `control-telemedicina-general`, `control-telemedicina-especializada`.

Uso esperado: dado el **Coverage** del paciente (para obtener la aseguradora) y el **tipo de consulta** de la cita, la aplicación consulta esta matriz y asigna la duración en minutos al crear o validar el **Slot** (`end - start` = duración en minutos).

---

## Tarea 2 – Dos casos prácticos: duración del Slot según Coverage del paciente

Se demuestra con dos casos que la duración del Slot (`end - start`) coincide con la regla definida a partir del **Coverage** del paciente (aseguradora) y el tipo de consulta.

### Caso 1 – Paciente con Salud Completa, control medicina general (30 min)

| Dato | Valor |
|------|--------|
| **Paciente** | pat-ejemplo-001 |
| **Coverage** | cov-001 → `payor`: Organization/org-aseguradora-salud-completa → **Salud Completa** |
| **Tipo de consulta** | Control – Medicina general |
| **Regla (matriz)** | Salud Completa + Control medicina general → **30 min** |
| **Slot** | slot-pediatria-001 |
| **Slot.start** | 2025-02-19T08:00:00-05:00 |
| **Slot.end** | 2025-02-19T08:30:00-05:00 |
| **Duración Slot (end − start)** | 30 min |

**Conclusión:** La duración del Slot (30 min) corresponde a la regla para paciente con Coverage Salud Completa y consulta tipo “Control – Medicina general”.

### Caso 2 – Paciente con Salud Cooperativa, control consulta especializada (30 min)

| Dato | Valor |
|------|--------|
| **Paciente** | pat-ejemplo-002 |
| **Coverage** | cov-002 → `payor`: Organization/org-aseguradora-salud-cooperativa → **Salud Cooperativa** |
| **Tipo de consulta** | Control – Consulta especializada |
| **Regla (matriz)** | Salud Cooperativa + Control especializada → **30 min** |
| **Slot** | slot-pediatria-002 |
| **Slot.start** | 2025-02-19T08:30:00-05:00 |
| **Slot.end** | 2025-02-19T09:00:00-05:00 |
| **Duración Slot (end − start)** | 30 min |

**Conclusión:** La duración del Slot (30 min) corresponde a la regla para paciente con Coverage Salud Cooperativa y consulta tipo “Control – Consulta especializada”.

### Resumen de los dos casos

| Caso | Paciente | Aseguradora (vía Coverage) | Tipo consulta | Duración regla | Slot | Duración Slot | ¿Coincide? |
|------|----------|----------------------------|---------------|----------------|------|---------------|------------|
| 1 | pat-ejemplo-001 | Salud Completa (cov-001) | Control medicina general | 30 min | slot-pediatria-001 | 30 min | Sí |
| 2 | pat-ejemplo-002 | Salud Cooperativa (cov-002) | Control especializada | 30 min | slot-pediatria-002 | 30 min | Sí |

En ambos casos, el **Coverage** del paciente determina la aseguradora y, junto con el tipo de consulta, la duración según la matriz; el **Slot** tiene exactamente esa duración en `end - start`.

### Flujo de uso en el sistema

1. El paciente (o el canal) solicita una cita: se identifica **Patient** y **tipo de consulta**.
2. Se obtiene el **Coverage** activo del paciente (`Coverage?beneficiary=Patient/<id>`).
3. De `Coverage.payor` se obtiene la **Organization** aseguradora y se mapea a la clave de la matriz (Salud Completa / Salud Cooperativa).
4. Con **tipo de consulta** y **aseguradora** se consulta `config/duracion-citas.json` (o equivalente) y se obtiene la **duración en minutos**.
5. Al crear o ofrecer un **Slot**, se garantiza que `end - start` sea igual a esa duración (en minutos).

---

## Resumen de cumplimiento RF-09

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Matriz de reglas (tipo consulta × aseguradora → duración en minutos) | Cumplida | Tabla en documento de contexto; `config/duracion-citas.json` |
| Tarea 2 – Dos casos prácticos: duración del Slot según Coverage del paciente | Cumplida | Caso 1 (Salud Completa, control MG, 30 min) y Caso 2 (Salud Cooperativa, control esp., 30 min); Slots slot-pediatria-001 y slot-pediatria-002 |
