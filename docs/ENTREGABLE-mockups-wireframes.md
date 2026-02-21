# Entregable – Wireframes o mockups de las interfaces

**Requisito (Documento de contexto, sección 4 – Entregables del equipo):**  
Incluir wireframes o mockups de las interfaces.

**Objetivo:** Definir y realizar wireframes o mockups (o **interfaces desarrolladas con código**) que muestren las interfaces por las que los usuarios (pacientes u operadores) interactúan con el sistema de agendas de ACME Salud, alineados a los canales y flujos del proyecto.

**Formas de cumplimiento:**  
- **Opción A:** Wireframes o mockups estáticos (imágenes, PDF, Figma, etc.).  
- **Opción B:** Interfaces implementadas con código (web, app responsive, vistas operador, etc.).  

**En este proyecto se sigue la Opción B.** El plan de trabajo por tareas está en la sección [Plan de trabajo – Desarrollo en código](#plan-de-trabajo--desarrollo-en-código): se hace una tarea, se documenta la evidencia en el checklist y se sigue con la siguiente.

---

## Alcance del entregable

Los canales de atención definidos en el documento de contexto son:

- Sitio web de ACME Salud  
- Call Center  
- Aplicación móvil  
- Ventanilla de información (módulo de agendas del HIS)

El modelo FHIR es común a todos (RNF-06); lo que cambia es la **interfaz de usuario** de cada canal. Las pantallas (en mockup o en código) deben reflejar al menos los flujos principales soportados por el sistema:

1. **Consulta de disponibilidad** (RF-06): filtrar por sede, servicio y/o profesional; ver Slot libres.  
2. **Agendamiento de cita** (RF-07): elegir Slot, confirmar datos (paciente, tipo de consulta); crear Appointment y recibir AppointmentResponse.  
3. **Cancelación de cita** (RF-08): localizar cita existente, cancelar y opcionalmente indicar motivo.

---

## Desarrollo con código (estrategia recomendada)

Se puede cumplir el entregable desarrollando las interfaces con código y siguiendo el mismo plan de pantallas. Ventaja: una sola aplicación puede cubrir varios canales.

### Web + App móvil = misma aplicación (responsive)

- **Una sola codebase** (p. ej. React, Vue, Next.js o HTML/CSS/JS) con diseño **responsive**.
- En escritorio se usa como **sitio web**; en móvil como **app móvil** (o PWA instalable).
- Las mismas pantallas del checklist (inicio, sede, servicio, disponibilidad, datos paciente, confirmación, mis citas, cancelar) se implementan una vez y se adaptan al tamaño de pantalla.

### Call Center

- **Misma aplicación web** con una **vista o rol “operador”**: pantallas de consulta de disponibilidad, registro de cita con datos del paciente y cancelación.
- O una **app separada** (p. ej. otra ruta `/operador` o subdominio) que consuma el mismo servidor FHIR; las pantallas son equivalentes a las del checklist (consulta, registro, cancelación).

### HIS (Ventanilla)

- **Opción 1:** Módulo o siembra dentro del HIS existente que consuma el servidor FHIR (mismas operaciones: GET Slot, POST Appointment, etc.). La “interfaz” es la del HIS con pantallas de disponibilidad, agendar y cancelar.
- **Opción 2:** Misma aplicación web usada en ventanilla (misma URL o siembra en iframe/vista integrada), documentando que ese canal usa la misma interfaz.

### Estructura sugerida si se desarrolla con código

```
frontend/                    # o nombre acordado (ej. webapp/)
  src/
    pages/                   # Pantallas (inicio, sede, disponibilidad, agendar, confirmación, mis-citas, cancelar)
    components/              # Componentes reutilizables
    services/                # Llamadas al servidor FHIR (Slot, Appointment, etc.)
  public/
  ...
docs/
  mockups/                   # Capturas de pantalla de la app (evidencia) o wireframes si se hicieron
```

Las **capturas de pantalla** de la aplicación en funcionamiento pueden guardarse en `docs/mockups/` como evidencia (igual que los mockups estáticos).

---

## Plan de trabajo – Desarrollo en código

Se desarrollan las interfaces en código **tarea por tarea**. Al terminar cada tarea se actualiza la evidencia en este documento (tablas del checklist y, si aplica, captura en `docs/mockups/`).

### Fase 0 – Proyecto y configuración

| # | Tarea | Qué hacer | Documentar al terminar | Estado |
|---|-------|-----------|------------------------|--------|
| 0.1 | Crear proyecto frontend | Crear app (ej. React + Vite, Vue o Next.js) en carpeta `frontend/`. Estructura: `src/pages/`, `src/components/`, `src/services/`. | En "Evidencia" de esta fila: ruta del proyecto (ej. `frontend/`). | Pendiente |
| 0.2 | Configurar servidor FHIR | Variable/archivo de config con URL base del servidor FHIR (ej. `http://hapi.fhir.org/baseR4`). Crear `services/fhir.js` (o similar) con función para peticiones GET/PUT/POST. | Breve nota en README del frontend o aquí: URL usada. | Pendiente |

### Fase 1 – Flujo paciente (Web + App responsive)

| # | Tarea | Pantalla / checklist que cumple | Qué hacer | Documentar al terminar | Estado |
|---|-------|----------------------------------|-----------|------------------------|--------|
| 1.1 | Pantalla Inicio / sede | Web #1, App #1 | Página de inicio con selección de sede (Norte, Centro, Sur). Navegación a siguiente paso. | En tabla "Canal: Sitio web" y "App móvil", fila Inicio/sede: Evidencia = ruta del componente (ej. `frontend/src/pages/Inicio.jsx`), Estado = Cumplida. Opcional: captura en `docs/mockups/web/01-inicio-sede.png`. | Pendiente |
| 1.2 | Pantalla Servicio / profesional | Web #2 | Selección de servicio médico y/o profesional (listado desde HealthcareService o PractitionerRole). | Tabla Web: fila "Selección de servicio o profesional" → Evidencia + Estado Cumplida. | Pendiente |
| 1.3 | Servicio FHIR: Slot libres | — | En `services/`: función que llame `GET Slot?status=free&schedule=...` (y opcionalmente por location). Usar `config/filtros-servidor-publico.json` o IDs de Schedule. | Sin checklist; opcional: anotar en README que el servicio está en `frontend/src/services/slot.js` (o nombre usado). | Pendiente |
| 1.4 | Pantalla Disponibilidad | Web #3, App #2 | Mostrar Slot libres (fecha, hora) según sede/servicio elegidos. Permitir elegir un Slot. | Tablas Web y App: fila "Consulta de disponibilidad" / "Disponibilidad" → Evidencia + Cumplida. Opcional: captura. | Pendiente |
| 1.5 | Pantalla Datos paciente / tipo consulta | Web #4 | Formulario: identificar paciente (o seleccionar), tipo de consulta (primera vez, control, telemedicina, general/especializada). | Tabla Web: fila "Datos del paciente / tipo de consulta" → Evidencia + Cumplida. | Pendiente |
| 1.6 | Servicio FHIR: Appointment y Slot busy | — | Función para crear `POST Appointment` (con slot, participant Patient + PractitionerRole, serviceType, start, end). Lógica o endpoint para actualizar Slot a `status: busy` (PUT). | README o comentario en código; sin fila en checklist. | Pendiente |
| 1.7 | Pantalla Confirmación de cita | Web #5, App #3 | Tras agendar, mostrar resumen (hora inicio/fin, servicio, médico) como AppointmentResponse. | Tablas Web y App: fila "Confirmación de cita" / "Agendar y confirmar" → Evidencia + Cumplida. Opcional: captura. | Pendiente |
| 1.8 | Pantalla Mis citas | Web #6, App #4 (parcial) | Listado de citas del paciente (GET Appointment?actor=Patient/... o equivalente). Enlaces a cancelar. | Tablas Web y App: fila "Mis citas" / "Mis citas / cancelar" (listado) → Evidencia + Cumplida. | Pendiente |
| 1.9 | Pantalla Cancelación + servicio | Web #7, App #4 | Formulario/modal para cancelar cita: motivo (cancelationReason). Servicio: PUT Appointment (status=cancelled, cancelationReason), PUT Slot (status=free). | Tablas Web y App: fila "Cancelación de cita" → Evidencia + Cumplida. Opcional: captura. | Pendiente |

### Fase 2 – Vista operador (Call Center)

| # | Tarea | Pantalla / checklist que cumple | Qué hacer | Documentar al terminar | Estado |
|---|-------|----------------------------------|-----------|------------------------|--------|
| 2.1 | Ruta o rol operador | — | Añadir ruta `/operador` (o rol "operador") que muestre vistas propias del Call Center. Layout distinto si se desea (mismo servicio FHIR). | Sin checklist; anotar en README o aquí. | Pendiente |
| 2.2 | Operador: disponibilidad, registro, cancelación | Call Center #1, #2, #3 | Tres pantallas (o pestañas): (1) Consulta Slot por sede/servicio/profesional, (2) Registro de cita con datos del paciente y Slot elegido + confirmación, (3) Búsqueda de cita y cancelación con motivo. | Tabla "Canal: Call Center": las tres filas → Evidencia (ruta o componente) + Estado Cumplida. Opcional: capturas en `docs/mockups/call-center/`. | Pendiente |

### Fase 3 – HIS (Ventanilla)

| # | Tarea | Pantalla / checklist que cumple | Qué hacer | Documentar al terminar | Estado |
|---|-------|----------------------------------|-----------|------------------------|--------|
| 3.1 | Uso en ventanilla HIS | HIS #1, #2, #3 | Opción A: Documentar que la misma app (o ruta `/operador`) se usa en ventanilla; Opción B: pantalla representativa de “módulo de agendas” que consuma FHIR (ej. iframe o enlace). | Tabla "Canal: HIS": marcar Evidencia (ej. "Misma app en ventanilla" + captura o ruta) y Estado Cumplida. | Pendiente |

### Resumen del plan de trabajo

| Fase | Tareas | Objetivo |
|------|--------|----------|
| 0 | 0.1, 0.2 | Proyecto frontend y conexión FHIR |
| 1 | 1.1 – 1.9 | Flujo completo paciente (web + app responsive): sede → servicio → disponibilidad → datos → confirmación → mis citas → cancelar |
| 2 | 2.1, 2.2 | Vista Call Center (operador) |
| 3 | 3.1 | HIS ventanilla (documentar o pantalla representativa) |

**Cómo ir documentando:** Después de cada tarea, actualizar en este mismo documento la tabla correspondiente del checklist (sección *Tarea 1 – Definir pantallas por canal*) y, si aplica, la fila del "Plan de trabajo" con Estado = **Cumplida** y evidencia (ruta del archivo o nombre de captura en `docs/mockups/`).

---

## Tarea 1 – Definir pantallas por canal (checklist)

Cada canal puede tener un conjunto de pantallas equivalente en función; el nivel de detalle (wireframe vs mockup vs implementación) queda a criterio del equipo.

### Checklist de pantallas sugeridas

Marcar cuando exista **wireframe, mockup o implementación** correspondiente. Si es código, indicar ruta/componente o captura en `docs/mockups/`.

#### Canal: Sitio web

| # | Pantalla / flujo | Descripción breve | Evidencia (mockup o implementación) | Estado |
|---|------------------|-------------------|-------------------------------------|--------|
| 1 | Inicio o selección de sede | Elegir sede (Norte, Centro, Sur) o punto de partida | | Pendiente |
| 2 | Selección de servicio o profesional | Elegir servicio médico y/o profesional (opcional) | | Pendiente |
| 3 | Consulta de disponibilidad | Listado o calendario de Slot libres (fecha, hora) | | Pendiente |
| 4 | Datos del paciente / tipo de consulta | Formulario para identificar paciente y tipo de consulta (primera vez, control, telemedicina, etc.) | | Pendiente |
| 5 | Confirmación de cita | Resumen de la cita y confirmación (equivalente a AppointmentResponse) | | Pendiente |
| 6 | Mis citas o historial | Listado de citas del paciente (para cancelar o consultar) | | Pendiente |
| 7 | Cancelación de cita | Pantalla para cancelar y, si aplica, indicar motivo | | Pendiente |

#### Canal: Aplicación móvil

*(Misma app que web si es responsive; evidencia: captura en móvil o ruta/componente.)*

| # | Pantalla / flujo | Descripción breve | Evidencia (mockup o implementación) | Estado |
|---|------------------|-------------------|---------------------|--------|
| 1 | Inicio / sede o servicio | Punto de entrada (sede, servicio o “agendar cita”) | | Pendiente |
| 2 | Disponibilidad | Slot libres (por fecha/hora) | | Pendiente |
| 3 | Agendar y confirmar | Datos paciente, tipo consulta, confirmación (AppointmentResponse) | | Pendiente |
| 4 | Mis citas / cancelar | Ver citas y opción de cancelar (motivo si aplica) | | Pendiente |

#### Canal: Call Center (operador)

*(Puede ser la misma app web con vista/rol operador o ruta dedicada.)*

| # | Pantalla / flujo | Descripción breve | Evidencia (mockup o implementación) | Estado |
|---|------------------|-------------------|-------------------------------------|--------|
| 1 | Consulta de disponibilidad | Vista del operador para buscar Slot por sede/servicio/profesional | | Pendiente |
| 2 | Registro de cita | Formulario con datos del paciente y Slot elegido; confirmación (AppointmentResponse) | | Pendiente |
| 3 | Cancelación de cita | Búsqueda de cita por paciente/fecha y cancelación con motivo | | Pendiente |

#### Canal: HIS (Ventanilla de información)

*(Módulo en HIS existente que consuma FHIR, o misma app embebida/usada en ventanilla.)*

| # | Pantalla / flujo | Descripción breve | Evidencia (mockup o implementación) | Estado |
|---|------------------|-------------------|-------------------------------------|--------|
| 1 | Módulo de agendas | Acceso al módulo de agendas dentro del HIS (ventanilla) | | Pendiente |
| 2 | Disponibilidad y agendamiento | Consulta Slot y registro de cita (integrado al flujo del HIS) | | Pendiente |
| 3 | Cancelación | Cancelación de cita desde el HIS con motivo si aplica | | Pendiente |

*(El nivel de detalle puede ser “una pantalla representativa del módulo” si el equipo prioriza otros canales.)*

---

## Tarea 2 – Ubicación de los archivos y convención

### Si se usan wireframes o mockups estáticos

- **Carpeta:** `docs/mockups/` con subcarpetas opcionales por canal (`web/`, `app-movil/`, `call-center/`, `his-ventanilla/`).
- **Formatos:** PNG, JPG o PDF. Herramientas: Figma, Balsamiq, draw.io, etc.  
- **Nombres:** descriptivos, ej. `web-consulta-disponibilidad.png`, `app-confirmacion-cita.png`.

### Si se desarrolla con código

- **Código:** carpeta en la raíz del proyecto (ej. `frontend/` o `webapp/`) con la estructura sugerida en *Desarrollo con código*.
- **Evidencia:** capturas de pantalla de la aplicación en `docs/mockups/` (por canal o por flujo) y, en las tablas, indicar la ruta del componente o página (ej. `frontend/src/pages/Disponibilidad.jsx`).

### Relación con el modelo FHIR

En cada pantalla que corresponda, se puede indicar brevemente qué recurso FHIR soporta la acción (opcional pero útil para la presentación):

| Pantalla / acción | Recurso FHIR asociado |
|-------------------|------------------------|
| Consulta de disponibilidad | GET Slot?status=free&schedule=... |
| Confirmación de cita | Appointment, AppointmentResponse |
| Cancelación | Appointment (status=cancelled, cancelationReason), Slot (status=free) |

---

## Resumen de cumplimiento – Entregable mockups/wireframes

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Tarea 1 – Pantallas por canal (web, app, call center, HIS): consulta disponibilidad, agendar, cancelar (mockups o implementación) | Pendiente | `docs/mockups/` y/o carpeta de código (ej. `frontend/`); tablas de este doc con evidencia y Estado “Cumplida” |
| Tarea 2 – Ubicación y convención | Definida | Estructura en esta sección; actualizar cuando se añadan archivos o código |

---

## Cómo actualizar este documento al completar las interfaces

**Si usaste mockups/wireframes:**  
1. Añadir archivos en `docs/mockups/` (y subcarpetas si aplica).  
2. En las tablas, rellenar **Evidencia** con el nombre del archivo y **Estado** con “Cumplida”.

**Si desarrollaste con código:**  
1. Dejar el código en la carpeta acordada (ej. `frontend/`).  
2. Opcional: guardar capturas de pantalla en `docs/mockups/` por canal o flujo.  
3. En las tablas, rellenar **Evidencia** con ruta del componente/página (ej. `frontend/src/pages/ConfirmacionCita.jsx`) o nombre de la captura, y **Estado** con “Cumplida”.  
4. En “Resumen de cumplimiento”, marcar Tarea 1 como **Cumplida** e indicar la evidencia (carpeta de código y/o `docs/mockups/`).
