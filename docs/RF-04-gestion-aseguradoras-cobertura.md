# RF-04 – Gestión de Aseguradoras y Cobertura

**Objetivo:** Representar las aseguradoras y la cobertura del paciente.

---

## Tarea 1 – Crear recursos Organization (aseguradoras)

Se crearon los dos recursos `Organization` correspondientes a las aseguradoras del escenario: **Salud Completa** y **Salud Cooperativa**.

### Ubicación de los recursos

| Aseguradora       | Archivo | Id del recurso |
|-------------------|---------|----------------|
| Salud Completa    | `fhir_resources/Organization/org-aseguradora-salud-completa.json`  | `org-aseguradora-salud-completa`  |
| Salud Cooperativa | `fhir_resources/Organization/org-aseguradora-salud-cooperativa.json` | `org-aseguradora-salud-cooperativa` |

### Campos implementados (por recurso)

Cada `Organization` de aseguradora incluye:

| Campo         | Presente | Descripción |
|---------------|----------|-------------|
| `id`          | Sí       | Identificador único (convención `org-*`) |
| `identifier`  | Sí       | Sistema `http://www.minsalud.gov.co/aseguradoras` con valor interno |
| `name`        | Sí       | Nombre de la aseguradora |
| `type`        | Sí       | Tipo `pay` (Payer) del code system HL7 organization-type |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Valores de identifier por aseguradora

| Aseguradora       | identifier.value   |
|-------------------|--------------------|
| Salud Completa    | SALUD-COMPLETA-001 |
| Salud Cooperativa | SALUD-COOP-001     |

### Cómo cargar en el servidor

Las aseguradoras son Organizaciones; pueden cargarse junto con el resto de recursos. Orden recomendado: **Organization** (incluidas aseguradoras y org-acme-salud) antes que recursos que las referencien (p. ej. Coverage).

```bash
python scripts/cargar_recursos.py
```

O cargar solo las aseguradoras manualmente (después de tener cargada la organización ACME si se usa en otros flujos):

```bash
# Sustituir BASE_URL por la URL del servidor (ej. http://hapi.fhir.org/baseR4)
curl -X PUT "BASE_URL/Organization/org-aseguradora-salud-completa"  -H "Content-Type: application/fhir+json" -d @fhir_resources/Organization/org-aseguradora-salud-completa.json
curl -X PUT "BASE_URL/Organization/org-aseguradora-salud-cooperativa" -H "Content-Type: application/fhir+json" -d @fhir_resources/Organization/org-aseguradora-salud-cooperativa.json
```

---

## Tarea 2 – Crear ejemplos de Coverage y verificar identificación de aseguradora

Se crearon dos recursos `Coverage` que vinculan paciente (beneficiary), aseguradora (payor) y estado, permitiendo identificar la aseguradora de cada paciente.

### Ubicación de los recursos

| Archivo | Id del recurso | Paciente (beneficiary) | Aseguradora (payor) |
|---------|----------------|------------------------|---------------------|
| `fhir_resources/Coverage/cov-001.json` | `cov-001` | Patient/pat-ejemplo-001 | Salud Completa |
| `fhir_resources/Coverage/cov-002.json` | `cov-002` | Patient/pat-ejemplo-002 | Salud Cooperativa |

### Campos implementados (por recurso)

Cada `Coverage` incluye:

| Campo         | Presente | Descripción |
|---------------|----------|-------------|
| `id`          | Sí       | Identificador único (convención `cov-*`) |
| `status`      | Sí       | Estado de la cobertura (ej. `active`) |
| `beneficiary` | Sí       | Referencia al `Patient` que es beneficiario |
| `payor`       | Sí       | Referencia a la `Organization` aseguradora que paga |

Se añadió `meta.profile` según buenas prácticas FHIR R4.

### Verificación: Coverage permite identificar la aseguradora del paciente

A partir de un `Coverage` se obtiene la aseguradora del paciente mediante `Coverage.payor[0].reference` → `Organization/<id>`. Tabla de validación:

| Coverage.id | Patient (beneficiary)     | Aseguradora (payor)              | ¿Identificación correcta? |
|-------------|---------------------------|----------------------------------|---------------------------|
| cov-001     | Patient/pat-ejemplo-001   | Organization/org-aseguradora-salud-completa  | Sí – Salud Completa   |
| cov-002     | Patient/pat-ejemplo-002   | Organization/org-aseguradora-salud-cooperativa | Sí – Salud Cooperativa |

**Conclusión:** El recurso `Coverage` permite identificar de forma inequívoca la aseguradora del paciente mediante la referencia `payor` a la `Organization` correspondiente. Esta relación se usa en RF-09 para determinar la duración de la cita según aseguradora y tipo de consulta.

### Cómo verificar en el servidor

1. **Consultar los Coverage:**
   ```http
   GET http://localhost:8080/fhir/Coverage
   ```
   (En servidor público: `GET http://hapi.fhir.org/baseR4/Coverage`; filtrar por `_id=cov-001,cov-002` si aplica.)

2. **Comprobar en cada entrada** que `resource.beneficiary.reference` apunte a un Patient y `resource.payor[0].reference` a una Organization (aseguradora).

3. **Consultar Coverage por paciente** (si el servidor lo permite):
   ```http
   GET http://localhost:8080/fhir/Coverage?beneficiary=Patient/pat-ejemplo-001
   ```

### Verificación con script (opcional)

Desde la raíz del proyecto, con el servidor levantado (sustituir `BASE_URL` por la URL real):

```bash
curl -s "BASE_URL/Coverage" -H "Accept: application/fhir+json" | python -c "
import json, sys
d = json.load(sys.stdin)
for e in d.get('entry', []):
    r = e.get('resource', {})
    ben = r.get('beneficiary', {}).get('reference', '')
    payor = r.get('payor', [{}])[0].get('reference', '') if r.get('payor') else ''
    print(r.get('id'), 'beneficiary:', ben, '| payor:', payor)
"
```

Salida esperada: para cada Coverage, la referencia al Patient y a la Organization aseguradora, permitiendo identificar la aseguradora del paciente.

---

## Resumen de cumplimiento RF-04

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear Organization Salud Completa y Salud Cooperativa | Cumplida | Archivos en `fhir_resources/Organization/` (org-aseguradora-*) |
| Tarea 2 – Crear al menos dos Coverage con beneficiary, payor, status; verificar identificación de aseguradora | Cumplida | cov-001 y cov-002 en `fhir_resources/Coverage/`; tabla de validación en esta sección |
