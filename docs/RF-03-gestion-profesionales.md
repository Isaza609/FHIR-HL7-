# RF-03 – Gestión de Profesionales

**Objetivo:** Modelar los médicos especialistas y su relación con la institución.

---

## Tarea 1 – Crear recursos Practitioner

Se crearon los seis recursos `Practitioner` correspondientes a los médicos especialistas del escenario, con los campos mínimos requeridos.

### Ubicación de los recursos

| Médico            | Archivo | Id del recurso |
|-------------------|---------|----------------|
| Gregorio Casas    | `fhir_resources/Practitioner/prac-gregorio-casas.json`   | `prac-gregorio-casas`   |
| Elmer Luna        | `fhir_resources/Practitioner/prac-elmer-luna.json`       | `prac-elmer-luna`       |
| Luis Manuel Chávez| `fhir_resources/Practitioner/prac-luis-manuel-chavez.json`| `prac-luis-manuel-chavez`|
| Álvaro Silva      | `fhir_resources/Practitioner/prac-alvaro-silva.json`    | `prac-alvaro-silva`     |
| Diego Narváez     | `fhir_resources/Practitioner/prac-diego-narvaez.json`   | `prac-diego-narvaez`    |
| Alonso Fonseca    | `fhir_resources/Practitioner/prac-alonso-fonseca.json`  | `prac-alonso-fonseca`   |

### Campos implementados (por recurso)

Cada `Practitioner` incluye:

| Campo        | Presente | Descripción |
|--------------|----------|-------------|
| `id`         | Sí       | Identificador único (convención `prac-*`) |
| `identifier` | Sí       | Tarjeta profesional: sistema `http://www.minsalud.gov.co/tarjeta-profesional`, valor según escenario |
| `name`       | Sí       | Nombre del profesional (family + given, use: official) |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Tarjeta profesional por médico (según documento de contexto)

| Médico            | identifier.value (tarjeta profesional) |
|-------------------|----------------------------------------|
| Gregorio Casas    | 111222333 |
| Elmer Luna        | 222333444 |
| Luis Manuel Chávez| 333444555 |
| Álvaro Silva      | 444777333 |
| Diego Narváez     | 555222999 |
| Alonso Fonseca    | 777666555 |

### Cómo cargar en el servidor

El orden de carga debe respetar dependencias: **Organization**, **Location**, **HealthcareService**, después **Practitioner** y **PractitionerRole**. Con el servidor FHIR en marcha:

```bash
python scripts/cargar_recursos.py
```

O cargar solo Practitioner y PractitionerRole una vez cargados Organization, Location y HealthcareService (sustituir `BASE_URL` por la URL del servidor):

```bash
# Practitioners
curl -X PUT "BASE_URL/Practitioner/prac-gregorio-casas"    -H "Content-Type: application/fhir+json" -d @fhir_resources/Practitioner/prac-gregorio-casas.json
curl -X PUT "BASE_URL/Practitioner/prac-elmer-luna"         -H "Content-Type: application/fhir+json" -d @fhir_resources/Practitioner/prac-elmer-luna.json
# ... resto de Practitioners (ver tabla anterior)
# PractitionerRoles (después de Practitioners)
curl -X PUT "BASE_URL/PractitionerRole/pr-casas-pediatria-norte" -H "Content-Type: application/fhir+json" -d @fhir_resources/PractitionerRole/pr-casas-pediatria-norte.json
# ... resto de PractitionerRoles
```

El script `scripts/cargar_recursos.py` respeta el orden definido en `fhir_resources/README.md`.

---

## Tarea 2 – Crear recursos PractitionerRole y documentar relación médico–sede–servicio

Se crearon los seis recursos `PractitionerRole` que vinculan cada médico con la organización ACME Salud, la sede (`location`) y el servicio que presta (`healthcareService`).

### Ubicación de los recursos

| PractitionerRole   | Archivo | Id del recurso |
|-------------------|---------|----------------|
| Casas – Pediatría Norte   | `fhir_resources/PractitionerRole/pr-casas-pediatria-norte.json`   | `pr-casas-pediatria-norte`   |
| Luna – Obstetricia Norte | `fhir_resources/PractitionerRole/pr-luna-obstetricia-norte.json`  | `pr-luna-obstetricia-norte`  |
| Chávez – Nefrología Centro | `fhir_resources/PractitionerRole/pr-chavez-nefrologia-centro.json` | `pr-chavez-nefrologia-centro` |
| Silva – Gastroenterología Centro | `fhir_resources/PractitionerRole/pr-silva-gastro-centro.json` | `pr-silva-gastro-centro` |
| Narváez – Oncología Sur  | `fhir_resources/PractitionerRole/pr-narvaez-oncologia-sur.json`   | `pr-narvaez-oncologia-sur`   |
| Fonseca – Cardiología Sur| `fhir_resources/PractitionerRole/pr-fonseca-cardiologia-sur.json` | `pr-fonseca-cardiologia-sur` |

### Campos implementados (por recurso)

Cada `PractitionerRole` incluye:

| Campo              | Presente | Descripción |
|--------------------|----------|-------------|
| `id`               | Sí       | Identificador único (convención `pr-*`) |
| `practitioner`     | Sí       | Referencia al `Practitioner` (médico) |
| `organization`     | Sí       | Referencia a `Organization/org-acme-salud` (ACME Salud) |
| `location`         | Sí       | Referencia a la `Location` (sede) donde ejerce |
| `healthcareService`| Sí       | Referencia al `HealthcareService` que presta en esa sede |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Relación entre médico, sede y servicio

Cada médico tiene un único rol en una sede y un servicio. La siguiente tabla documenta la relación **Practitioner → PractitionerRole → Location + HealthcareService**:

| Médico (Practitioner) | PractitionerRole.id      | Sede (Location) | Servicio (HealthcareService) |
|-----------------------|--------------------------|------------------|------------------------------|
| Gregorio Casas        | pr-casas-pediatria-norte | Clínica Norte (loc-norte)   | Pediatría (hs-pediatria-norte)   |
| Elmer Luna            | pr-luna-obstetricia-norte| Clínica Norte (loc-norte)   | Obstetricia (hs-obstetricia-norte)|
| Luis Manuel Chávez    | pr-chavez-nefrologia-centro | Clínica Centro (loc-centro) | Nefrología (hs-nefrologia-centro)  |
| Álvaro Silva          | pr-silva-gastro-centro   | Clínica Centro (loc-centro) | Gastroenterología (hs-gastroenterologia-centro) |
| Diego Narváez         | pr-narvaez-oncologia-sur | Clínica Sur (loc-sur)       | Oncología (hs-oncologia-sur)      |
| Alonso Fonseca        | pr-fonseca-cardiologia-sur | Clínica Sur (loc-sur)     | Cardiología (hs-cardiologia-sur) |

**Conclusión:** La relación **médico–sede–servicio** queda modelada mediante `PractitionerRole`: un mismo médico (Practitioner) se asocia a la organización, a una sede concreta y a un único HealthcareService en esa sede. Esto permite en RF-05 asignar agendas por PractitionerRole y en RF-06/RF-07 filtrar disponibilidad y citas por profesional.

### Cómo verificar en el servidor

1. **Consultar todos los PractitionerRole:**
   ```http
   GET http://localhost:8080/fhir/PractitionerRole
   ```
   (En servidor público: `GET http://hapi.fhir.org/baseR4/PractitionerRole?organization=Organization/org-acme-salud` para filtrar solo ACME.)

2. **Comprobar en cada entrada** que existan `practitioner`, `organization`, `location[0]` y `healthcareService[0]`, y que las referencias sean coherentes con la tabla anterior.

3. **Consultar por organización:**
   ```http
   GET http://localhost:8080/fhir/PractitionerRole?organization=Organization/org-acme-salud
   ```

### Verificación con script (opcional)

Desde la raíz del proyecto, con el servidor levantado (sustituir `BASE_URL` por la URL real):

```bash
curl -s "BASE_URL/PractitionerRole?organization=Organization/org-acme-salud" -H "Accept: application/fhir+json" | python -c "
import json, sys
d = json.load(sys.stdin)
for e in d.get('entry', []):
    r = e.get('resource', {})
    prac = r.get('practitioner', {}).get('reference', '')
    loc = r.get('location', [{}])[0].get('reference', '') if r.get('location') else ''
    hs = r.get('healthcareService', [{}])[0].get('reference', '') if r.get('healthcareService') else ''
    print(r.get('id'), '|', prac, '|', loc, '|', hs)
"
```

Salida esperada: una línea por PractitionerRole con médico, sede y servicio referenciados.

---

## Resumen de cumplimiento RF-03

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear 6 Practitioner con id, identifier (tarjeta profesional), name | Cumplida | Archivos en `fhir_resources/Practitioner/` |
| Tarea 2 – Crear PractitionerRole con practitioner, organization, location, healthcareService; documentar relación médico–sede–servicio | Cumplida | Archivos en `fhir_resources/PractitionerRole/`; tabla de relación en esta sección |
