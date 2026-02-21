# RF-02 – Gestión de Servicios

**Objetivo:** Modelar los servicios médicos ofrecidos en cada sede.

---

## Tarea 1 – Crear recursos HealthcareService

Se crearon los nueve recursos `HealthcareService` correspondientes a los servicios del escenario (una combinación servicio–sede por recurso), con los campos mínimos requeridos.

### Ubicación de los recursos

| Sede   | Servicio          | Archivo | Id del recurso |
|--------|-------------------|---------|----------------|
| Norte  | Medicina general  | `fhir_resources/HealthcareService/hs-medicina-general-norte.json`  | `hs-medicina-general-norte`  |
| Norte  | Pediatría         | `fhir_resources/HealthcareService/hs-pediatria-norte.json`         | `hs-pediatria-norte`         |
| Norte  | Obstetricia       | `fhir_resources/HealthcareService/hs-obstetricia-norte.json`       | `hs-obstetricia-norte`       |
| Centro | Medicina general  | `fhir_resources/HealthcareService/hs-medicina-general-centro.json`| `hs-medicina-general-centro` |
| Centro | Nefrología        | `fhir_resources/HealthcareService/hs-nefrologia-centro.json`       | `hs-nefrologia-centro`       |
| Centro | Gastroenterología | `fhir_resources/HealthcareService/hs-gastroenterologia-centro.json`| `hs-gastroenterologia-centro`|
| Sur    | Medicina general  | `fhir_resources/HealthcareService/hs-medicina-general-sur.json`    | `hs-medicina-general-sur`    |
| Sur    | Oncología         | `fhir_resources/HealthcareService/hs-oncologia-sur.json`           | `hs-oncologia-sur`           |
| Sur    | Cardiología       | `fhir_resources/HealthcareService/hs-cardiologia-sur.json`         | `hs-cardiologia-sur`         |

### Campos implementados (por recurso)

Cada `HealthcareService` incluye:

| Campo        | Presente | Descripción |
|--------------|----------|-------------|
| `id`         | Sí       | Identificador único (convención `hs-*`) |
| `name`       | Sí       | Nombre del servicio y sede (ej. «Pediatría - Norte») |
| `providedBy` | Sí       | Referencia a `Organization/org-acme-salud` (ACME Salud) |
| `location`   | Sí       | Referencia a la `Location` donde se presta el servicio (una por recurso) |

Se añadió además `active: true` y `meta.profile` según buenas prácticas FHIR R4.

### Correspondencia con el documento de contexto

| Clínica | Identificador | Servicios (recurso HealthcareService por cada uno) |
|---------|---------------|----------------------------------------------------|
| Norte  | 1100155555-1   | Medicina general, Pediatría, Obstetricia |
| Centro | 1100155555-2   | Medicina general, Nefrología, Gastroenterología |
| Sur    | 1100155555-3   | Medicina general, Oncología, Cardiología |

### Cómo cargar en el servidor

El orden de carga debe respetar dependencias: primero **Organization**, luego **Location**, después **HealthcareService**. Con el servidor FHIR en marcha:

```bash
python scripts/cargar_recursos.py
```

O cargar solo hasta HealthcareService (orden obligatorio):

```bash
# Sustituir BASE_URL por la URL del servidor (ej. http://hapi.fhir.org/baseR4 o http://localhost:8080/fhir)
curl -X PUT "%BASE_URL%/Organization/org-acme-salud" -H "Content-Type: application/fhir+json" -d @fhir_resources/Organization/org-acme-salud.json
curl -X PUT "%BASE_URL%/Location/loc-norte"  -H "Content-Type: application/fhir+json" -d @fhir_resources/Location/loc-norte.json
curl -X PUT "%BASE_URL%/Location/loc-centro" -H "Content-Type: application/fhir+json" -d @fhir_resources/Location/loc-centro.json
curl -X PUT "%BASE_URL%/Location/loc-sur"    -H "Content-Type: application/fhir+json" -d @fhir_resources/Location/loc-sur.json
curl -X PUT "%BASE_URL%/HealthcareService/hs-medicina-general-norte"  -H "Content-Type: application/fhir+json" -d @fhir_resources/HealthcareService/hs-medicina-general-norte.json
# ... resto de HealthcareService (ver lista en tabla anterior)
```

El script `scripts/cargar_recursos.py` carga todos los recursos en el orden definido en `fhir_resources/README.md`.

---

## Tarea 2 – Tabla de validación Location → HealthcareService

Cada `HealthcareService` debe estar asociado a una única sede (`Location`) donde se presta. A continuación se documenta la relación y su verificación.

### Tabla de validación

| Location (sede) | Location.id  | HealthcareService        | HealthcareService.id             | location[0].reference | ¿Asociación correcta? |
|-----------------|--------------|--------------------------|----------------------------------|------------------------|------------------------|
| Clínica Norte   | loc-norte    | Medicina general - Norte | hs-medicina-general-norte        | Location/loc-norte     | Sí                     |
| Clínica Norte   | loc-norte    | Pediatría - Norte        | hs-pediatria-norte               | Location/loc-norte     | Sí                     |
| Clínica Norte   | loc-norte    | Obstetricia - Norte      | hs-obstetricia-norte             | Location/loc-norte     | Sí                     |
| Clínica Centro  | loc-centro   | Medicina general - Centro| hs-medicina-general-centro       | Location/loc-centro    | Sí                     |
| Clínica Centro  | loc-centro   | Nefrología - Centro      | hs-nefrologia-centro             | Location/loc-centro    | Sí                     |
| Clínica Centro  | loc-centro   | Gastroenterología - Centro | hs-gastroenterologia-centro    | Location/loc-centro    | Sí                     |
| Clínica Sur     | loc-sur      | Medicina general - Sur   | hs-medicina-general-sur          | Location/loc-sur       | Sí                     |
| Clínica Sur     | loc-sur      | Oncología - Sur          | hs-oncologia-sur                 | Location/loc-sur       | Sí                     |
| Clínica Sur     | loc-sur      | Cardiología - Sur        | hs-cardiologia-sur               | Location/loc-sur       | Sí                     |

**Conclusión:** Cada servicio está asociado únicamente a la sede donde se presta. La relación **Location → HealthcareService** es 1:N (una sede, múltiples servicios).

### Cómo verificar en el servidor

1. **Consultar todos los HealthcareService del servidor:**
   ```http
   GET http://localhost:8080/fhir/HealthcareService
   ```
   (En servidor público HAPI: `GET http://hapi.fhir.org/baseR4/HealthcareService`; usar filtros por `location` o por nuestros IDs para limitar resultados.)

2. **Comprobar en cada entrada** que `resource.location[0].reference` coincida con la sede esperada (`Location/loc-norte`, `Location/loc-centro` o `Location/loc-sur`).

3. **Consultar por sede** (si el servidor lo permite):
   ```http
   GET http://localhost:8080/fhir/HealthcareService?location=Location/loc-norte
   GET http://localhost:8080/fhir/HealthcareService?location=Location/loc-centro
   GET http://localhost:8080/fhir/HealthcareService?location=Location/loc-sur
   ```

### Verificación con script (opcional)

Desde la raíz del proyecto, con el servidor levantado (sustituir `BASE_URL` por la URL real):

```bash
curl -s "BASE_URL/HealthcareService" -H "Accept: application/fhir+json" | python -c "
import json, sys
d = json.load(sys.stdin)
for e in d.get('entry', []):
    r = e.get('resource', {})
    loc = r.get('location', [{}])[0].get('reference', '')
    name = r.get('name', '')
    print(r.get('id'), name, '->', loc)
"
```

Salida esperada: nueve líneas con cada `HealthcareService.id`, nombre y referencia a `Location/loc-norte`, `Location/loc-centro` o `Location/loc-sur` según corresponda.

---

## Resumen de cumplimiento RF-02

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Crear HealthcareService por servicio/sede con id, name, providedBy, location | Cumplida | Archivos en `fhir_resources/HealthcareService/` |
| Tarea 2 – Tabla de validación Location → HealthcareService | Cumplida | Tabla y pasos de verificación en esta sección |
