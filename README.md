# Proyecto Integrador – Interoperabilidad de Agendas con HL7 FHIR

Sistema de interoperabilidad de agendas para **ACME Salud** basado en **HL7 FHIR R4** (RNF-01). Repositorio central de Schedule, Slot y Appointment para múltiples canales (web, call center, app, HIS).

---

## Servidor FHIR

El proyecto usa el servidor público **HAPI FHIR** (R4), no es necesario levantar nada en local:

- **Base URL:** http://hapi.fhir.org/baseR4  
- **Metadatos:** http://hapi.fhir.org/baseR4/metadata  

Las peticiones se hacen desde **Postman** (recomendado) o con los scripts de Python.

---

## Uso con Postman

### 1. Importar colección y entorno

1. Abre [Postman](https://www.postman.com/downloads/).
2. **File → Import** y selecciona los archivos de la carpeta `postman/`:
   - `ACME-Salud-FHIR-R4.postman_collection.json` (colección de peticiones)
   - `ACME-Salud-HAPI-baseR4.postman_environment.json` (entorno con la URL del servidor)
3. En la esquina superior derecha de Postman, elige el entorno **"ACME Salud - HAPI baseR4"**.

### 2. Probar que el servidor responde

En la colección **ACME Salud - FHIR R4**, abre **Metadatos → GET CapabilityStatement (metadata)** y pulsa **Send**. Debe devolver **200** y un JSON con las capacidades del servidor R4.

### 3. Consultas (GET)

La colección incluye peticiones para:

- **Organization**, **Location**, **HealthcareService**, **Practitioner**, **PractitionerRole**
- **Patient**, **Coverage**, **Schedule**, **Slot**, **Appointment**

Por ejemplo: **Slot → GET Slots libres** (`{{baseUrl}}/Slot?status=free`) para ver disponibilidad (RF-06).

### 4. Cargar recursos (PUT)

Para crear o actualizar recursos en hapi.fhir.org:

1. **Orden:** primero **Organization**, luego **Location**, después el resto (HealthcareService, Practitioner, etc.). Ver `fhir_resources/README.md`.
2. En Postman, usa las peticiones **Cargar recursos (PUT)** como plantilla, o crea una nueva:
   - **Método:** PUT  
   - **URL:** `http://hapi.fhir.org/baseR4/<ResourceType>/<id>` (ej. `http://hapi.fhir.org/baseR4/Location/loc-norte`)
   - **Headers:** `Accept: application/fhir+json`, `Content-Type: application/fhir+json`
   - **Body → raw → JSON:** copia el contenido del archivo en `fhir_resources/<ResourceType>/<archivo>.json`

Instrucciones detalladas en **postman/README.md**.

---

## Uso con scripts (Python, opcional)

Si prefieres cargar todos los recursos de una vez:

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python scripts/cargar_recursos.py http://hapi.fhir.org/baseR4
```

Consultar slots libres:

```bash
python scripts/consulta_slots_libres.py http://hapi.fhir.org/baseR4
```

---

## Requisitos

- [Postman](https://www.postman.com/downloads/) (recomendado) o cualquier cliente HTTP
- Opcional: Python 3.8+ para los scripts de carga

---

## Estructura del proyecto

```
FHIR HL7/
├── config/                    # Configuración
│   ├── fhir-server.json       # URL y recursos soportados
│   ├── duracion-citas.json    # Matriz tipo consulta + aseguradora → duración (RF-09)
│   └── convencion-identificadores.md   # Prefijos e id únicos (RNF-05)
├── docs_plan/                 # Documentación del curso (contexto, requisitos, plan)
├── docs/                      # Documentación técnica y por requisito funcional
│   ├── RF-01-gestion-sedes.md # RF-01: sedes y tabla Organization → Location
│   ├── arquitectura-servidor-central.md
│   ├── estados-validos.md
│   ├── canales-atencion.md
│   └── consistencia-datos.md
├── fhir_resources/            # Recursos FHIR R4 (JSON)
│   ├── Organization/         # ACME Salud + aseguradoras
│   ├── Location/              # Norte, Centro, Sur
│   ├── HealthcareService/     # Servicios por sede
│   ├── Practitioner/         # Médicos especialistas
│   ├── PractitionerRole/     # Médico–Organización–Sede–Servicio
│   ├── Patient/
│   ├── Coverage/
│   ├── Schedule/              # Agenda por servicio y por médico
│   ├── Slot/
│   ├── Appointment/
│   └── AppointmentResponse/
├── postman/                   # Colección y entorno para Postman (hapi.fhir.org/baseR4)
│   ├── ACME-Salud-FHIR-R4.postman_collection.json
│   ├── ACME-Salud-HAPI-baseR4.postman_environment.json
│   └── README.md
├── scripts/
│   ├── cargar_recursos.py     # Carga masiva de recursos
│   └── consulta_slots_libres.py
├── docker-compose.yml         # Opcional: servidor local HAPI FHIR R4
├── requirements.txt
└── README.md
```

---

## Estándar y recursos

- **Estándar:** HL7 FHIR R4 ([spec](https://hl7.org/fhir/R4/)).
- Recursos utilizados: Organization, Location, HealthcareService, Practitioner, PractitionerRole, Patient, Coverage, Schedule, Slot, Appointment, AppointmentResponse (campos según `docs_plan/4. Atributos mínimos de los recursos FHIR utilizados.md`).

---

## Referencias

- [HL7 FHIR R4](https://hl7.org/fhir/R4/)
- [HAPI FHIR](https://hapifhir.io/)
- Documentación del curso en `docs_plan/`
