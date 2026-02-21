# RF-05 – Gestión de Agendas

**Objetivo:** Modelar agendas mensuales por servicio y por médico.

---

## Tarea 1 – Crear recursos Schedule asociados a HealthcareService (agenda por servicio)

Se crearon recursos `Schedule` mensuales cuyo `actor` es un **HealthcareService**, representando la agenda de disponibilidad del servicio en una sede para un mes.

### Ubicación de los recursos (ejemplo implementado)

| Tipo de agenda | HealthcareService (actor) | Archivo | Id del recurso |
|----------------|---------------------------|---------|----------------|
| Por servicio   | Pediatría - Norte         | `fhir_resources/Schedule/sched-hs-pediatria-2025-02.json` | `sched-hs-pediatria-2025-02` |

El mismo patrón puede extenderse al resto de servicios (Nefrología, Gastroenterología, Obstetricia, etc.) con un Schedule por servicio y mes (por ejemplo `sched-hs-nefrologia-centro-2025-02`).

### Campos implementados (por recurso)

Cada `Schedule` de tipo “agenda por servicio” incluye:

| Campo             | Presente | Descripción |
|--------------------|----------|-------------|
| `id`               | Sí       | Identificador único (convención `sched-hs-<servicio>-<año>-<mes>`) |
| `actor`            | Sí       | Referencia al `HealthcareService` al que pertenece la agenda |
| `planningHorizon`  | Sí       | Inicio y fin del mes: `start` y `end` en formato ISO 8601 |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Ejemplo de planningHorizon (mes)

Para febrero 2025:

- **start:** `2025-02-01T00:00:00-05:00`
- **end:** `2025-02-28T23:59:59-05:00`

---

## Tarea 2 – Crear recursos Schedule asociados a PractitionerRole (agenda por médico)

Se crearon recursos `Schedule` mensuales cuyo `actor` es un **PractitionerRole**, representando la agenda de disponibilidad de un médico en una sede y servicio concretos para un mes.

### Ubicación de los recursos (ejemplo implementado)

| Tipo de agenda | PractitionerRole (actor) | Archivo | Id del recurso |
|----------------|---------------------------|---------|----------------|
| Por médico     | Casas – Pediatría Norte   | `fhir_resources/Schedule/sched-pr-casas-2025-02.json` | `sched-pr-casas-2025-02` |

El mismo patrón puede extenderse al resto de PractitionerRole (Luna, Chávez, Silva, Narváez, Fonseca) con un Schedule por rol y mes (por ejemplo `sched-pr-luna-2025-02`).

### Campos implementados (por recurso)

Cada `Schedule` de tipo “agenda por médico” incluye:

| Campo             | Presente | Descripción |
|--------------------|----------|-------------|
| `id`               | Sí       | Identificador único (convención `sched-pr-<apellido>-<año>-<mes>` o similar) |
| `actor`            | Sí       | Referencia al `PractitionerRole` al que pertenece la agenda |
| `planningHorizon`  | Sí       | Inicio y fin del mes: `start` y `end` en formato ISO 8601 |

---

## Diferencia entre ambos tipos de agenda

| Aspecto              | Agenda por servicio (actor = HealthcareService) | Agenda por médico (actor = PractitionerRole) |
|----------------------|--------------------------------------------------|-----------------------------------------------|
| **Actor**            | `Schedule.actor` → HealthcareService             | `Schedule.actor` → PractitionerRole           |
| **Qué representa**   | Ventana de tiempo en que el **servicio** en una sede ofrece citas (sin asignar médico concreto). | Ventana de tiempo en que un **médico concreto** en una sede y servicio tiene disponibilidad. |
| **Granularidad**     | Por servicio y sede (ej. “Pediatría en Norte tiene agenda en febrero”). | Por profesional, sede y servicio (ej. “Dr. Casas en Pediatría Norte en febrero”). |
| **Uso típico**       | Consultas donde interesa solo sede + servicio; el sistema asigna después el profesional. | Consultas donde el paciente elige o el sistema filtra por médico (RF-06, RF-07). |
| **Convención de id** | `sched-hs-<servicio>-<año>-<mes>`                | `sched-pr-<identificador-rol>-<año>-<mes>`    |

**Conclusión:** En el modelo conceptual (ver `docs_plan/2. Modelo conceptual de interoperabilidad basado en HL7 FHIR.md`) se implementan **dos tipos de agenda**: una por **HealthcareService** (disponibilidad del servicio) y otra por **PractitionerRole** (disponibilidad del médico). Los **Slot** se asocian a un único Schedule; según el flujo de negocio, los Slot pueden crearse sobre agendas por servicio o por médico. La existencia de ambos tipos permite consultar disponibilidad por servicio (RF-06) y por profesional.

### Cómo cargar en el servidor

Los Schedule dependen de HealthcareService y PractitionerRole; deben cargarse después de ellos. Con el servidor FHIR en marcha:

```bash
python scripts/cargar_recursos.py
```

O cargar solo los Schedule (sustituir `BASE_URL` por la URL del servidor):

```bash
curl -X PUT "BASE_URL/Schedule/sched-hs-pediatria-2025-02" -H "Content-Type: application/fhir+json" -d @fhir_resources/Schedule/sched-hs-pediatria-2025-02.json
curl -X PUT "BASE_URL/Schedule/sched-pr-casas-2025-02" -H "Content-Type: application/fhir+json" -d @fhir_resources/Schedule/sched-pr-casas-2025-02.json
```

El script `scripts/cargar_recursos.py` respeta el orden definido en `fhir_resources/README.md`.

### Cómo verificar en el servidor

1. **Consultar todos los Schedule:**
   ```http
   GET http://localhost:8080/fhir/Schedule
   ```
   (En servidor público: `GET http://hapi.fhir.org/baseR4/Schedule`; filtrar por `_id` si aplica.)

2. **Comprobar** que cada Schedule tenga `actor[0].reference` apuntando a un HealthcareService o a un PractitionerRole, y `planningHorizon.start` / `planningHorizon.end` con el rango del mes.

3. **Consultar por actor** (si el servidor lo permite):
   ```http
   GET http://localhost:8080/fhir/Schedule?actor=HealthcareService/hs-pediatria-norte
   GET http://localhost:8080/fhir/Schedule?actor=PractitionerRole/pr-casas-pediatria-norte
   ```

---

## Resumen de cumplimiento RF-05

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear Schedule mensuales asociados a HealthcareService (id, actor, planningHorizon) | Cumplida | Ejemplo: `sched-hs-pediatria-2025-02` en `fhir_resources/Schedule/` |
| Tarea 2 – Crear Schedule mensuales asociados a PractitionerRole; documentar diferencia entre ambos tipos | Cumplida | Ejemplo: `sched-pr-casas-2025-02` en `fhir_resources/Schedule/`; tabla comparativa en esta sección |
