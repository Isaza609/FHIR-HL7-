# RF-01 – Gestión de Sedes

**Objetivo:** Modelar las tres sedes de ACME Salud dentro del servidor FHIR.

---

## Tarea 1 – Crear recursos Location

Se crearon los tres recursos `Location` correspondientes a las sedes **Norte**, **Centro** y **Sur**, con los campos mínimos requeridos.

### Ubicación de los recursos

| Sede   | Archivo              | Id del recurso |
|--------|----------------------|----------------|
| Norte  | `fhir_resources/Location/loc-norte.json`  | `loc-norte`  |
| Centro | `fhir_resources/Location/loc-centro.json` | `loc-centro` |
| Sur    | `fhir_resources/Location/loc-sur.json`    | `loc-sur`    |

### Campos implementados (por recurso)

Cada `Location` incluye:

| Campo                 | Presente | Descripción |
|-----------------------|----------|-------------|
| `id`                  | Sí       | Identificador único (convención `loc-*`) |
| `identifier`          | Sí       | Sistema `http://www.minsalud.gov.co/sedes` con valor del escenario |
| `name`                | Sí       | Nombre de la clínica (Clínica Norte / Centro / Sur) |
| `managingOrganization`| Sí       | Referencia a `Organization/org-acme-salud` (ACME Salud) |

Se añadió además `status: active` y `meta.profile` según buenas prácticas FHIR R4.

### Valores de identifier por sede (según documento de contexto)

| Sede   | identifier.value |
|--------|-------------------|
| Norte  | 1100155555-1      |
| Centro | 1100155555-2      |
| Sur    | 1100155555-3      |

### Cómo cargar en el servidor

Con el servidor FHIR en marcha:

```bash
python scripts/cargar_recursos.py
```

O cargar solo Organization y Location manualmente (orden obligatorio: primero Organization, luego Location):

```bash
# Desde la raíz del proyecto, con el servidor en http://localhost:8080/fhir
curl -X PUT "http://localhost:8080/fhir/Organization/org-acme-salud" -H "Content-Type: application/fhir+json" -d @fhir_resources/Organization/org-acme-salud.json
curl -X PUT "http://localhost:8080/fhir/Location/loc-norte"  -H "Content-Type: application/fhir+json" -d @fhir_resources/Location/loc-norte.json
curl -X PUT "http://localhost:8080/fhir/Location/loc-centro" -H "Content-Type: application/fhir+json" -d @fhir_resources/Location/loc-centro.json
curl -X PUT "http://localhost:8080/fhir/Location/loc-sur"    -H "Content-Type: application/fhir+json" -d @fhir_resources/Location/loc-sur.json
```

---

## Tarea 2 – Tabla de validación Organization → Location

Cada `Location` debe estar correctamente asociada a la `Organization` principal (ACME Salud). A continuación se documenta la relación y su verificación.

### Tabla de validación

| Organization (ACME Salud) | Location        | Location.id  | managingOrganization      | ¿Asociación correcta? |
|---------------------------|-----------------|--------------|---------------------------|------------------------|
| org-acme-salud            | Clínica Norte   | loc-norte    | Organization/org-acme-salud | Sí                    |
| org-acme-salud            | Clínica Centro  | loc-centro   | Organization/org-acme-salud | Sí                    |
| org-acme-salud            | Clínica Sur     | loc-sur      | Organization/org-acme-salud | Sí                    |

**Conclusión:** Las tres sedes están asociadas únicamente a la organización `org-acme-salud`. La relación **Organization → Location** es 1:N (una organización, múltiples ubicaciones).

### Cómo verificar en el servidor

1. **Consultar todas las Location del servidor:**
   ```http
   GET http://localhost:8080/fhir/Location
   ```

2. **Comprobar en cada entrada** que `resource.managingOrganization.reference` sea `Organization/org-acme-salud`.

3. **Consultar la Organization principal** y opcionalmente buscar Location por organización:
   ```http
   GET http://localhost:8080/fhir/Organization/org-acme-salud
   GET http://localhost:8080/fhir/Location?partof=Organization/org-acme-salud
   ```
   (En FHIR R4, la relación “gestionada por” se expresa con `managingOrganization` en Location; el parámetro de búsqueda puede variar según el servidor.)

### Verificación con script (opcional)

Desde la raíz del proyecto, con el servidor levantado:

```bash
curl -s "http://localhost:8080/fhir/Location" -H "Accept: application/fhir+json" | python -c "
import json, sys
d = json.load(sys.stdin)
for e in d.get('entry', []):
    r = e.get('resource', {})
    ref = r.get('managingOrganization', {}).get('reference', '')
    ok = ref == 'Organization/org-acme-salud'
    print(r.get('id'), r.get('name'), '->', ref, 'OK' if ok else 'ERROR')
"
```

Salida esperada: las tres líneas con `OK` al final.

---

## Resumen de cumplimiento RF-01

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear Location Norte, Centro, Sur con id, identifier, name, managingOrganization | Cumplida | Archivos en `fhir_resources/Location/` |
| Tarea 2 – Tabla de validación Organization → Location | Cumplida | Tabla y pasos de verificación en esta sección |
