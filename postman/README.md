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

## Nota sobre hapi.fhir.org

El servidor público puede **resetear o borrar datos** periódicamente. Es adecuado para pruebas y para el curso; para datos persistentes haría falta un servidor propio (por ejemplo con Docker).
