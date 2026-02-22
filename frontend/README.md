# Frontend ACME Salud – Agendas FHIR

Interfaz web (y responsive para app móvil) para agendamiento de citas. Consume el servidor FHIR R4 del proyecto.

## Estructura

- `src/pages/` – Pantallas (inicio, sede, disponibilidad, agendar, confirmación, mis citas, cancelar)
- `src/components/` – Componentes reutilizables
- `src/services/` – Llamadas al servidor FHIR (`fhir.js`: GET, PUT, POST; `slot.js`: Slot libres; `appointment.js`: crear Appointment y poner Slot en busy)
- `src/config.js` – URL base del servidor FHIR

## Servidor FHIR

Por defecto se usa **http://hapi.fhir.org/baseR4** (HAPI FHIR público R4).

Para cambiar la URL (ej. servidor local), crea un archivo `.env` en esta carpeta:

```
VITE_FHIR_BASE_URL=http://localhost:8080/fhir
```

O edita `src/config.js`.

## Cómo correr

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (ej. http://localhost:5173).

**Importante:** En desarrollo, las peticiones al servidor FHIR pasan por un **proxy** (Vite) para evitar errores de CORS en el navegador. La app llama a `http://localhost:5173/api/fhir/...` y Vite reenvía a `http://hapi.fhir.org/baseR4/...`. Si no ves datos, reinicia el servidor (`Ctrl+C` y luego `npm run dev` de nuevo).

## Canales

- **Sitio web / app:** rutas `/`, `/servicios`, `/disponibilidad`, etc. (flujo paciente).
- **Call Center y ventanilla HIS:** ruta `/operador` (vista operador: disponibilidad, registro de cita, cancelación). La misma app se usa en ventanilla de información; el HIS puede enlazar o embeber la URL `/operador` como módulo de agendas.

## Stack

- React 19 + Vite 6
- Sin backend propio: todas las operaciones van al servidor FHIR (Slot, Appointment, etc.)
