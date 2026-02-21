# RF-06 – Consulta de Disponibilidad

**Objetivo:** Permitir la visualización de espacios disponibles.

---

## Tarea 1 – Crear recursos Slot asociados a un Schedule

Se crearon múltiples recursos `Slot` asociados a un `Schedule`, con los campos requeridos y estado **free** para representar espacios disponibles.

### Ubicación de los recursos

| Slot              | Archivo | Id del recurso | Schedule asociado |
|-------------------|---------|----------------|-------------------|
| slot-pediatria-001| `fhir_resources/Slot/slot-pediatria-001.json` | `slot-pediatria-001` | sched-pr-casas-2025-02 |
| slot-pediatria-002| `fhir_resources/Slot/slot-pediatria-002.json` | `slot-pediatria-002` | sched-pr-casas-2025-02 |
| slot-pediatria-003| `fhir_resources/Slot/slot-pediatria-003.json` | `slot-pediatria-003` | sched-pr-casas-2025-02 |

Todos pertenecen al Schedule **sched-pr-casas-2025-02** (agenda del Dr. Casas – Pediatría Norte, febrero 2025). El mismo patrón puede extenderse a otros Schedule con más Slot.

### Campos implementados (por recurso)

Cada `Slot` incluye:

| Campo      | Presente | Descripción |
|------------|----------|-------------|
| `id`       | Sí       | Identificador único (convención `slot-*`) |
| `start`    | Sí       | Inicio del intervalo en ISO 8601 |
| `end`      | Sí       | Fin del intervalo en ISO 8601 |
| `status`   | Sí       | `free` (disponible para reserva) |
| `schedule` | Sí       | Referencia al `Schedule` al que pertenece el Slot |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Ejemplo de intervalos (Slot libres)

| Slot              | start                        | end                          | status |
|-------------------|------------------------------|------------------------------|--------|
| slot-pediatria-001| 2025-02-19T08:00:00-05:00     | 2025-02-19T08:30:00-05:00     | free   |
| slot-pediatria-002| 2025-02-19T08:30:00-05:00     | 2025-02-19T09:00:00-05:00     | free   |
| slot-pediatria-003| 2025-02-19T09:00:00-05:00     | 2025-02-19T09:30:00-05:00     | free   |

### Cómo cargar en el servidor

Los Slot dependen de Schedule; deben cargarse después. Con el servidor FHIR en marcha:

```bash
python scripts/cargar_recursos.py
```

O cargar solo los Slot (sustituir `BASE_URL` por la URL del servidor):

```bash
curl -X PUT "BASE_URL/Slot/slot-pediatria-001" -H "Content-Type: application/fhir+json" -d @fhir_resources/Slot/slot-pediatria-001.json
curl -X PUT "BASE_URL/Slot/slot-pediatria-002" -H "Content-Type: application/fhir+json" -d @fhir_resources/Slot/slot-pediatria-002.json
curl -X PUT "BASE_URL/Slot/slot-pediatria-003" -H "Content-Type: application/fhir+json" -d @fhir_resources/Slot/slot-pediatria-003.json
```

---

## Tarea 2 – Simular consulta de disponibilidad (Slot free filtrados por sede, servicio, profesional)

La consulta de disponibilidad consiste en obtener únicamente los `Slot` con **status = free**, pudiendo filtrar por sede, servicio o profesional. En FHIR, los Slot no tienen parámetros de búsqueda directos por sede/servicio/profesional; el filtro se hace a través del **Schedule** al que pertenece el Slot (cada Schedule está asociado a un HealthcareService o a un PractitionerRole, y estos a su vez a una Location/sede).

### Relación filtro → recurso FHIR

| Filtro       | Cómo se modela en FHIR | Ejemplo |
|--------------|------------------------|---------|
| **Sede**     | Schedules cuyo actor (HealthcareService o PractitionerRole) tiene esa Location | Norte → Schedule de hs-pediatria-norte, pr-casas-pediatria-norte, etc. |
| **Servicio** | Schedule cuyo actor es ese HealthcareService | Pediatría Norte → `Schedule/sched-hs-pediatria-2025-02` |
| **Profesional** | Schedule cuyo actor es ese PractitionerRole | Dr. Casas (Pediatría Norte) → `Schedule/sched-pr-casas-2025-02` |

Consulta API: **GET Slot?status=free&schedule=Schedule/<id>** (repetir `schedule` si se quieren varios). Solo se muestran Slot con **status = free**.

### Simulación con script

El proyecto incluye el script `scripts/consulta_slots_libres.py`, que consulta Slot con **status=free** y, por defecto, solo los Schedule de ACME (según `config/filtros-servidor-publico.json`), para no traer datos de otros proyectos en servidor público.

**Consultar todos los slots libres (nuestros Schedule):**
```bash
python scripts/consulta_slots_libres.py http://hapi.fhir.org/baseR4
```

**Filtrar por profesional** (ej. agenda del Dr. Casas):
```bash
python scripts/consulta_slots_libres.py http://hapi.fhir.org/baseR4 --schedule sched-pr-casas-2025-02
```

**Filtrar por servicio** (ej. agenda del servicio Pediatría Norte):
```bash
python scripts/consulta_slots_libres.py http://hapi.fhir.org/baseR4 --schedule sched-hs-pediatria-2025-02
```

Salida esperada (ejemplo): número total de slots libres y listado de id, start y end de cada uno (hasta 20 en pantalla).

### Simulación con petición HTTP

Sustituir `BASE_URL` por la URL del servidor (ej. `http://hapi.fhir.org/baseR4`).

**Solo Slot libres de un Schedule (ej. por profesional):**
```http
GET BASE_URL/Slot?status=free&schedule=Schedule/sched-pr-casas-2025-02
```

**Solo Slot libres de un servicio:**
```http
GET BASE_URL/Slot?status=free&schedule=Schedule/sched-hs-pediatria-2025-02
```

**Varios Schedule a la vez (ej. toda la sede Norte:** Schedules de Pediatría y Casas en Norte):
```http
GET BASE_URL/Slot?status=free&schedule=Schedule/sched-hs-pediatria-2025-02&schedule=Schedule/sched-pr-casas-2025-02
```
(Comportamiento exacto depende del servidor; en HAPI suele interpretarse como OR.)

### Resumen: filtros por sede, servicio y profesional

| Filtro        | Acción |
|---------------|--------|
| **Sede**      | Obtener los Schedule cuyos actores (HealthcareService o PractitionerRole) están en esa Location; luego consultar Slot con `status=free` y esos `schedule`. Los IDs de Schedule por sede pueden mantenerse en configuración (ej. `filtros-servidor-publico.json`) o resolverse desde HealthcareService/PractitionerRole + Location. |
| **Servicio**  | Usar el Schedule cuyo `actor` es el HealthcareService deseado. Ej.: `Slot?status=free&schedule=Schedule/sched-hs-pediatria-2025-02`. |
| **Profesional** | Usar el Schedule cuyo `actor` es el PractitionerRole del médico. Ej.: `Slot?status=free&schedule=Schedule/sched-pr-casas-2025-02`. |

En todos los casos se muestran **únicamente** los Slot con **status = free**.

### Cómo verificar en el servidor

1. Cargar los recursos (Organization, Location, HealthcareService, Practitioner, PractitionerRole, Schedule, Slot) y ejecutar:
   ```bash
   python scripts/consulta_slots_libres.py http://hapi.fhir.org/baseR4 --schedule sched-pr-casas-2025-02
   ```
2. Comprobar que la respuesta solo incluya Slot con `resource.status = "free"` y que los intervalos `start`/`end` correspondan a los creados.

---

## Resumen de cumplimiento RF-06

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear múltiples Slot asociados a un Schedule (id, start, end, status=free) | Cumplida | Tres Slot en `fhir_resources/Slot/` asociados a sched-pr-casas-2025-02 |
| Tarea 2 – Simular consulta de disponibilidad mostrando solo Slot free filtrados por sede, servicio, profesional | Cumplida | Script `consulta_slots_libres.py` y ejemplos GET Slot?status=free&schedule=...; documentación de mapeo filtro → Schedule en esta sección |
