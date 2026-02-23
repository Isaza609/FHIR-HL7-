# Temario exclusivo – Interfaces y cierre (~10 min)

**Para la persona que expone:** pantallas por canal, relación con FHIR y cierre de la presentación.

**Duración total de tu bloque:** ~10 min (~4 min interfaces + ~3 min cierre; el resto para transición y margen).

**Nota sobre la interfaz actual:** Las pantallas muestran etiquetas **Req. 1** a **Req. 7** que enlazan con el documento de contexto (§3 Requerimientos). Puedes decir exactamente lo de "Qué decir" en cada vista; si quieres apoyarte en lo que se ve, puedes añadir la frase opcional que se indica. La cabecera del operador dice "Call Center – Agenda interoperable" (el logo sigue siendo ACME Salud).

**Cómo mencionar los requerimientos:** En cada vista hay un bloque *"Para mencionar (de forma natural)"* con frases para enlazar lo que se ve en pantalla con lo que pide el documento de contexto. Úsalas con naturalidad al explicar la pantalla, sin decir de forma literal "esto cumple el requisito tal".

---

## 1. Qué te toca sustentar (en una frase)

*“El entregable de interfaces está implementado en código (Opción B): una sola app web que cubre los cuatro canales (web, app móvil, Call Center, ventanilla HIS) y los tres flujos (consulta de disponibilidad, agendamiento, cancelación), consumiendo el mismo servidor FHIR que Andrea mostró en Postman.”*

---

## 2. Orden recomendado de la exposición

| Paso | Qué hacer | Tiempo orientativo |
|------|-----------|--------------------|
| 1 | Introducción: “Ahora les muestro las interfaces que consumen ese mismo servidor FHIR.” | 0,5 min |
| 2 | **Flujo paciente (web):** Inicio → Servicios → Disponibilidad → Datos paciente → Confirmación → (opcional) Mis citas / Cancelar | 3–4 min |
| 3 | **Vista operador (Call Center):** entrar a `/operador`, mostrar las 3 pestañas y una acción rápida (ej. elegir slot o buscar cita) | 1,5–2 min |
| 4 | **Relación pantalla ↔ FHIR:** mostrar la tabla en diapositiva (o decirla) | 0,5 min |
| 5 | **Cierre:** resumen del proyecto, cumplimiento de entregables, referencias | 2–3 min |

---

## 3. Qué decir y qué destacar en cada vista

### 3.1 Inicio (página principal – `/`)

- **Qué mostrar:** pantalla con las 3 sedes (Clínica Norte, Centro, Sur).
- **Qué decir:** *“El paciente entra por aquí y elige la sede. Detrás se hace un GET a Location con los IDs de nuestras sedes; es el punto de partida del flujo y cumple con el checklist de inicio del sitio web y de la app.”*
- **Relación FHIR:** `GET Location?_id=...` (sedes ACME).
- **Para mencionar (de forma natural):** *"Todas las solicitudes de citas de los distintos canales —web, Call Center, app, ventanilla— van al mismo servidor FHIR, así el control de las agendas queda centralizado."*
- **Requisito / checklist:** Web #1, App #1 (Inicio / selección de sede).

---

### 3.2 Servicios (`/servicios?location=loc-norte`)

- **Qué mostrar:** listado de servicios de la sede elegida (ej. Medicina general, Pediatría, Obstetricia en Norte).
- **Qué decir:** *“Según la sede elegida, se consultan los servicios con GET HealthcareService por Location. El usuario elige servicio y pasa a ver la disponibilidad.”*
- **Relación FHIR:** `GET HealthcareService?location=Location/{id}`.
- **Para mencionar (de forma natural):** *"Cada uno de estos servicios tiene su propia agenda definida mensualmente; lo mismo ocurre con los médicos en su rol dentro de la institución. Al elegir servicio, la disponibilidad que veremos después sale de esas agendas."*
- **Requisito:** Web #2 (Selección de servicio o profesional).

---

### 3.3 Disponibilidad (`/disponibilidad`)

- **Qué mostrar:** lista de horarios (fecha y hora de cada slot) y botón “Elegir”.
- **Qué decir:** *“Aquí se muestran los Slot libres, que son los mismos que Andrea consultó en Postman: GET Slot con status=free y el Schedule del servicio. Al hacer clic en ‘Elegir’ se guarda ese slot para el siguiente paso. Esto es el RF-06 – consulta de disponibilidad.”*
- **Relación FHIR:** `GET Slot?status=free&schedule=Schedule/...` (o por HealthcareService).
- **Para mencionar (de forma natural):** *"Cada fila es un espacio de tiempo dentro de la agenda del servicio o del profesional. Cuando el paciente elige uno, ese es el slot que luego se registrará en la cita."*
- **Requisito:** Web #3, App #2 (Consulta de disponibilidad).

---

### 3.4 Datos del paciente y tipo de consulta (`/datos-paciente`)

- **Qué mostrar:** formulario con selector de paciente y tipo de consulta (primera vez, control, telemedicina, etc.). En pantalla aparece la cobertura del paciente (aseguradora) cuando tiene Coverage asociado.
- **Qué decir:** *“El usuario identifica al paciente —en producción vendría de login o búsqueda— y el tipo de consulta. Al enviar, la app crea el Appointment en el servidor FHIR, pone el Slot en busy y genera el AppointmentResponse. Es el flujo que Andrea mostró: POST Appointment y PUT Slot.”*
- **Relación FHIR:** `GET Patient` (listado); al enviar: `PUT Appointment`, `PUT Slot` (status=busy), `PUT AppointmentResponse`.
- **Para mencionar (de forma natural):** *"Aquí se ve la relación del paciente con su cobertura y la aseguradora: esa información es la que en el modelo permite determinar los tiempos de consulta según la aseguradora. Al confirmar, se registra el slot elegido dentro de la agenda y se genera la respuesta de cita."*
- **Requisito:** Web #4 (Datos paciente / tipo consulta), RF-07 (Agendamiento).

---

### 3.5 Confirmación (`/confirmacion`)

- **Qué mostrar:** resumen con hora inicio/fin, servicio, tipo de consulta, médico (asignado según agenda o nombre del Practitioner), paciente y número de cita. En pantalla aparece además el bloque "Contenido del AppointmentResponse (Req. 6)" y el detalle técnico FHIR. **Opcional al hablar:** *"Como ven, aquí se muestra lo que define el estándar: hora inicio/fin, servicio, médico tratante y comentarios."*
- **Qué decir:** *“Esta pantalla es el equivalente al AppointmentResponse: mismo modelo FHIR, mostrado al usuario. Incluye enlace a ‘Ver mis citas’ para consultar o cancelar.”*
- **Relación FHIR:** AppointmentResponse (inicio, fin, servicio, participante).
- **Para mencionar (de forma natural):** *"Lo que ve el usuario aquí es exactamente lo que el estándar define para la respuesta al agendar: hora de inicio y fin, servicio de salud, médico tratante y comentarios. Así el paciente queda informado de su cita de forma clara."*
- **Requisito:** Web #5, App #3 (Confirmación de cita).

---

### 3.6 Mis citas (`/mis-citas`)

- **Qué mostrar:** selector de paciente y listado de citas con botón “Cancelar cita”.
- **Qué decir:** *“Se consultan las citas del paciente con GET Appointment por actor (Patient). Desde aquí se puede ir a cancelar una cita.”*
- **Relación FHIR:** `GET Appointment?actor=Patient/{id}`.
- **Para mencionar (de forma natural):** *"Para cada paciente se ve también su cobertura y aseguradora, y en cada cita el profesional con el que quedó agendada. Si el usuario quiere cancelar, desde aquí accede al flujo de cancelación con motivo."*
- **Requisito:** Web #6, App #4 (Mis citas / listado).

---

### 3.7 Cancelación (`/cancelar-cita`)

- **Qué mostrar:** formulario con motivo de cancelación (paciente, prestador, enfermedad, mudanza, etc.) y botón “Confirmar cancelación”.
- **Qué decir:** *“Al confirmar, se hace PUT del Appointment con status=cancelled y cancelationReason, y PUT del Slot a free. Es el RF-08 – cancelación con motivo.”*
- **Relación FHIR:** `PUT Appointment` (status=cancelled, cancelationReason), `PUT Slot` (status=free).
- **Para mencionar (de forma natural):** *"Cuando el paciente cancela, el sistema no solo cambia el estado de la cita a cancelada: también guarda el motivo. Así queda trazabilidad y el slot vuelve a quedar disponible en la agenda."*
- **Requisito:** Web #7, App #4 (Cancelación de cita), RF-08.

---

### 3.8 Vista operador – Call Center (`/operador`)

- **Qué mostrar:** cabecera “ACME Salud – Call Center” y las 3 pestañas: **Disponibilidad**, **Registrar cita**, **Cancelar cita**.
- **Qué decir:** *“Para Call Center usamos la misma app con la ruta /operador. El operador tiene tres pantallas: consulta de disponibilidad por sede y servicio, registro de cita con datos del paciente y slot elegido, y búsqueda de cita por paciente para cancelar con motivo. Mismo servidor FHIR, mismo modelo; solo cambia la interfaz orientada al operador.”*
- **Para mencionar (de forma natural):** *"El operador usa exactamente el mismo modelo de datos: sedes, servicios, agendas, slots, paciente con su cobertura, y al agendar o cancelar se actualizan el Appointment y el Slot en el servidor central. Así todos los canales comparten la misma fuente de verdad."*
- **Relación FHIR:** Igual que el flujo paciente (Slot, Appointment, AppointmentResponse, cancelación); solo cambia el rol (operador agenda por el paciente).
- **Requisito:** Call Center #1, #2, #3 (consulta, registro, cancelación).

**Acción rápida para demo:** ir a Disponibilidad operador → elegir sede y servicio → mostrar slots → (opcional) “Elegir para agendar” y mostrar que lleva al formulario de registro. O ir a Cancelar cita y mostrar búsqueda por paciente y lista de citas.

---

### 3.9 HIS (Ventanilla)

- **Qué decir (sin necesidad de abrir otra app):** *“Para la ventanilla de información del HIS adoptamos la opción de reutilizar la misma aplicación: el módulo de agendas es la ruta /operador. El HIS puede enlazar esa URL o embeberla en un iframe. Así se cumple el canal HIS con el mismo código y el mismo FHIR.”*
- **Requisito:** HIS #1, #2, #3 (módulo de agendas, disponibilidad y agendamiento, cancelación).

---

## 4. Tabla para diapositiva o para decir en vivo

Usa esta tabla cuando expliques la relación entre pantallas y FHIR:

| Pantalla / acción            | Recurso FHIR / operación                                                                 |
|------------------------------|-------------------------------------------------------------------------------------------|
| Consulta de disponibilidad  | GET Slot?status=free&schedule=...                                                        |
| Confirmación de cita        | Appointment, AppointmentResponse                                                         |
| Cancelación                 | Appointment (status=cancelled, cancelationReason), Slot (status=free)                    |

**Frase de enlace:** *“Cada pantalla que les mostré se apoya en estas operaciones sobre el mismo servidor FHIR que vimos en Postman.”*

---

## 5. Cómo relacionar con lo que dijo Andrea

- **Al empezar tu bloque:** *“Ese flujo de Postman —GET Slot, POST Appointment, Slot a busy, AppointmentResponse— es exactamente el que consumen estas pantallas; solo que aquí el usuario hace clic y la app hace las peticiones por detrás.”*
- **En Confirmación:** *“Este resumen es el AppointmentResponse que se crea al agendar, con la misma información que el estándar define.”*
- **En Cancelación:** *“Al confirmar cancelación, la app hace el PUT del Appointment y del Slot que explicó Andrea, con el motivo en cancelationReason.”*

---

## 6. Cierre (~3 min)

### 6.1 Resumen del proyecto (una diapositiva o verbal)

- **Problema:** ACME con 3 sedes y varios canales necesitaba unificar agendas.
- **Solución:** Modelo común con HL7 FHIR R4 (Slot, Appointment, AppointmentResponse, etc.).
- **Arquitectura:** Un servidor FHIR central; todos los canales consumen el mismo API.
- **Interfaces:** Una app web que cubre web, app responsive, Call Center y ventanilla HIS; tres flujos: disponibilidad (RF-06), agendamiento (RF-07), cancelación (RF-08).

### 6.2 Cumplimiento de entregables

- Presentación 30 min.
- Ejemplos del modelo FHIR (Slot, Appointment) — Danilo.
- Demostración API (Postman) — Andrea.
- Wireframes/mockups o interfaces en código — **tú:** app en `frontend/`, rutas por canal, checklist cumplido.
- Referencias (HL7 FHIR R4, HAPI, docs del curso, repo).

### 6.3 Referencias (mostrar o nombrar)

- HL7 FHIR R4: https://hl7.org/fhir/R4/
- HAPI FHIR: https://hapifhir.io/
- Documentación del curso en `docs_plan/`
- Repositorio del proyecto (si aplica)

### 6.4 Frase para cerrar

*“Con esto cerramos la presentación: cumplimos con el modelo FHIR, los ejemplos, la API y las interfaces por canal. ¿Alguna pregunta?”*

---

## 7. Checklist antes de exponer (tu parte)

- [ ] Tener la app levantada: `cd frontend`, `npm run dev`; comprobar que abre en el navegador.
- [ ] Probar una vez el flujo completo: Inicio → Servicios → Disponibilidad → Elegir slot → Datos paciente → Confirmar → ver Confirmación.
- [ ] Probar acceso a `/operador`: pestañas visibles y al menos una acción (elegir sede/servicio o ver citas).
- [ ] Si usas datos mock (sin servidor): está bien; puedes decir *“Para la demo usamos datos estáticos; en producción la app se conecta al mismo servidor FHIR que vimos en Postman.”*
- [ ] Diapositiva (opcional) con la tabla “Pantalla ↔ Recurso FHIR” y/o con la lista de canales (web, app, Call Center, HIS).
- [ ] Ensayar tiempos: ~4 min flujo paciente + ~2 min operador + ~3 min cierre = ~9 min (dejar 1 min de margen).

---

## 8. Resumen en una hoja (para tener a mano)

| Vista | Ruta | Qué decir en una línea | FHIR |
|-------|------|------------------------|------|
| Inicio | `/` | Sedes; GET Location | Location |
| Servicios | `/servicios` | Servicios por sede; GET HealthcareService | HealthcareService |
| Disponibilidad | `/disponibilidad` | Slot libres; GET Slot free | Slot |
| Datos paciente | `/datos-paciente` | Paciente y tipo consulta; al enviar → Appointment + Slot busy | Appointment, Slot, AppointmentResponse |
| Confirmación | `/confirmacion` | Resumen = AppointmentResponse | AppointmentResponse |
| Mis citas | `/mis-citas` | Citas del paciente; GET Appointment por actor | Appointment |
| Cancelar | `/cancelar-cita` | Motivo; PUT Appointment cancelled, Slot free | Appointment, Slot |
| Operador | `/operador` | Call Center: disponibilidad, registrar, cancelar; mismo FHIR | Mismo modelo |
| HIS | (documentado) | Ventanilla usa `/operador` (misma app) | Mismo modelo |

**Cierre:** Resumen problema → FHIR → arquitectura → API → interfaces; entregables cumplidos; referencias; “¿Preguntas?”.

---

*Documento de apoyo para la persona que expone el bloque “Interfaces y cierre” en la presentación de 30 minutos.*
