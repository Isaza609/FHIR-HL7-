# Postman – ACME Salud FHIR R4

Uso del servidor público **http://hapi.fhir.org/baseR4** desde Postman.

## Importar en Postman

1. Abre Postman.
2. **Importar colección:** File → Import → arrastra o selecciona `ACME-Salud-FHIR-R4.postman_collection.json`.
3. **Importar entorno (opcional):** File → Import → selecciona `ACME-Salud-HAPI-baseR4.postman_environment.json`.
4. En la esquina superior derecha, elige el entorno **"ACME Salud - HAPI baseR4"** para que `{{baseUrl}}` sea `http://hapi.fhir.org/baseR4`.

## Probar el servidor

- Ejecuta **Metadatos → GET CapabilityStatement (metadata)**. Debe devolver 200 y el JSON del servidor R4.

## Cargar recursos desde Postman

La colección incluye ejemplos de **PUT** (Organization y Location). Para el resto de recursos:

1. Copia el contenido del JSON desde `fhir_resources/<ResourceType>/<archivo>.json`.
2. Crea una nueva petición PUT en Postman:
   - URL: `{{baseUrl}}/<ResourceType>/<id>` (ej. `{{baseUrl}}/Location/loc-centro`)
   - Headers: `Accept: application/fhir+json`, `Content-Type: application/fhir+json`
   - Body → raw → JSON: pega el contenido del archivo.
3. Orden recomendado: Organization → Location → HealthcareService → Practitioner → PractitionerRole → Patient → Coverage → Schedule → Slot.

## Filtros en servidor público

El servidor **hapi.fhir.org** es compartido con otros proyectos. Para no traer datos ajenos:

- Usa las peticiones **“(solo ACME)”** en cada carpeta (Organization, Location, Slot, Appointment, etc.).
- **Slot:** no uses una consulta sin `schedule`; usa **GET Slots libres (solo nuestros)** o **GET Slots por un Schedule**.
- **Appointment:** usa **GET Nuestras citas (solo ACME por sede)** en lugar de una búsqueda sin filtro.

## Flujo agendamiento (crear cita y marcar slot ocupado)

Para demostrar el flujo completo de agendamiento:

1. **Slot** → **GET Slots libres (solo nuestros)** o **GET Slots por un Schedule** (ver slots con `status=free`).
2. **Appointment** → **PUT Crear cita (Appointment)**: crea la cita referenciando un Slot, Patient y PractitionerRole (cuerpo basado en `fhir_resources/Appointment/appt-ejemplo.json`).
3. **Slot** → **PUT Slot a busy (marcar ocupado)**: actualiza el mismo slot a `status=busy` para que deje de aparecer como disponible.

## Flujo cancelación (cancelar cita y liberar slot)

Para demostrar la cancelación de una cita:

1. **Appointment** → **GET Appointment por id** (opcional: para ver la cita y el slot que referencia).
2. **Appointment** → **PUT Cancelar cita (Appointment)**: actualiza la cita con `status=cancelled` y `cancelationReason` (cuerpo desde `fhir_resources/Appointment/appt-ejemplo-cancelado.json`).
3. **Slot** → **PUT Slot a free (liberar slot)**: actualiza el slot a `status=free` para que vuelva a aparecer en la consulta de slots libres.

Los IDs de ACME están en `config/filtros-servidor-publico.json`.

## Nota sobre hapi.fhir.org

El servidor público puede **resetear o borrar datos** periódicamente. Es adecuado para pruebas y para el curso; para datos persistentes haría falta un servidor propio (por ejemplo con Docker).
