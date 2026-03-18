1. Objetivo real de la clase 2

La segunda clase debería permitir que el estudiante construya y entienda un mini ecosistema clínico interoperable donde:

existe una organización prestadora global compartida (`Organization`),

cada estudiante tiene su propia sede/hospital (`Location`) y profesionales vinculados mediante `Practitioner` + `PractitionerRole`,

se agenda o registra una atención (`Encounter`),

esa atención genera información clínica (`Observation` y `Condition`),

y todo queda enlazado con referencias FHIR válidas.

En otras palabras, la meta no es solo “usar recursos”, sino entender cómo FHIR permite que otro estudiante (otra sede) consulte, interprete y reutilice la historia clínica desde el mismo servidor HAPI, usando interoperabilidad por referencias y búsquedas.

2. Caso práctico propuesto
Escenario

ASMED SALUD es la entidad prestadora global de la clase (se comparte entre todos los estudiantes).

Cada estudiante tiene asignada una sede/hospital (por ejemplo `S01`, `S02`, `S03`...), representada en FHIR mediante su `Location`.

En cada sede hay profesionales y se registra una atención con `Encounter`, generando información clínica (`Observation` y `Condition`) asociada al `Patient`.

Historia funcional del ejercicio (interoperabilidad entre sedes de estudiantes)

Un paciente (por ejemplo María Gómez) es atendido primero por el estudiante `S01` en su sede:

- Patient + Practitioner/PractitionerRole + Location + Encounter + Observation + Condition

Días después, el estudiante `S02` identifica a la misma paciente y registra un nuevo `Encounter` en su sede:

- nuevas `Observation`
- (opcional) `Condition` como seguimiento o motivo clínico actualizado

El valor pedagógico está en que `S02` puede consultar y reutilizar lo registrado por `S01` porque los recursos están estructurados e interoperables en FHIR, enlazados por referencias y disponibles mediante búsquedas.

3. Diseño de la práctica de clase 2

Yo dividiría la práctica en 3 bloques.

Bloque A. Construcción del contexto institucional

Aquí el estudiante crea la estructura organizacional.

Recursos a crear

Organization

ASMED SALUD

Location

Hospital S0X (sede/hospital del estudiante)

Practitioner

Médico asignado al estudiante (1 o más)

PractitionerRole

Médico asignado en la sede del estudiante como rol del profesional (vinculado a `Organization` global y a su `Location`)

Qué aprende el estudiante aquí

Que `Organization` representa la entidad global compartida (común para toda la clase).

Que `Location` representa la sede asignada al estudiante (Hospital S0X).

Que `Practitioner` representa la persona (médico).

Que `PractitionerRole` representa el rol del profesional dentro de una `Organization`/`Location`, no solo su existencia.

Regla del curso: el código fijo del estudiante `S01`, `S02`, etc. debe quedar trazable en los recursos que crea (por ejemplo con `meta.tag` y/o `Location.identifier`) para permitir que la UI filtre “solo lo mío” vs “ver todo”.

Esto es clave porque mucha gente en FHIR confunde `Practitioner` con `PractitionerRole`.

Bloque B. Registro asistencial básico

Aquí el estudiante crea el flujo mínimo de atención.

Recursos a crear

Patient

María Gómez

Identificación, nombre, género, fecha de nacimiento, telecom, address

Encounter

Consulta externa en la sede del estudiante (Hospital S0X)

Referenciado a:

Patient

Practitioner/PractitionerRole

Location

Organization

Condition

Motivo o problema clínico

Ejemplo: cefalea o hipertensión arterial

Observation

Presión arterial

Frecuencia cardíaca

Temperatura

Peso

Talla

Qué aprende el estudiante aquí

Que el Patient es el eje de la historia.

Que el Encounter es el contexto clínico del evento.

Que las Observation no deben ir “solas”, sino asociadas al paciente y, si es posible, al encuentro.

Que la Condition expresa el problema o diagnóstico clínico.

Bloque C. Interoperabilidad entre sedes

Aquí aparece el verdadero valor pedagógico.

Extensión del caso

María Gómez (u otro paciente del curso) vuelve a consultar, pero ahora en la sede del estudiante `S0Y` (Hospital S0Y) con su médico. Ese médico debe poder:

identificar al mismo paciente,

consultar encuentros previos,

consultar observaciones previas,

verificar el problema clínico registrado (Condition),

registrar un nuevo `Encounter` y nuevas `Observation` (en su sede).

Recursos a crear

Segundo Encounter

Consulta en su sede (Hospital S0X)

Nuevas Observation

Nuevos signos vitales

Opcional: CarePlan, ServiceRequest o MedicationRequest

Si quieres cerrar con un ejemplo más robusto

Qué aprende el estudiante aquí

Que la interoperabilidad no es “mandar JSON”.

Que el valor está en que otro estudiante (otra sede del curso) pueda consultar, interpretar y reutilizar los recursos por sus referencias y estructura estándar (y que la UI permita filtrar “solo lo mío” vs “ver todo”).

Que el servidor FHIR se vuelve un repositorio clínico interoperable.

4. Flujo exacto sugerido para la práctica

Yo haría la clase 2 así, en este orden:

Fase 1. Preparación del servidor

Los estudiantes deben entrar a HAPI FHIR y validar que pueden:

crear recursos por POST,

consultar por GET,

actualizar por PUT o PATCH si quieres incluirlo,

buscar por parámetros.

No dedicaría mucho tiempo a teoría aquí. Solo validación operativa.

Fase 2. Crear la entidad y sedes

Orden recomendado:

Organization: ASMED SALUD (global compartida para toda la clase; se crea una vez)

Location: Hospital S0Y (una por estudiante; S01, S02, etc.)

Primero lo institucional, para que luego todo referencie algo existente.

Fase 3. Crear profesionales

Practitioner del estudiante (1 o más médicos)

PractitionerRole de cada médico en su sede (Hospital S0Y)

Aquí los estudiantes ya empiezan a ver relaciones.

Fase 4. Crear paciente

Patient María Gómez

Aquí puedes aprovechar para explicar identificadores, por ejemplo:

CC

MRN si quieres introducir identifier clínico interno

Fase 5. Crear primer acto asistencial

Encounter en la sede del estudiante (Hospital S0Y)

Condition

Observations

Aquí es donde más aprende el estudiante, porque ya ve el encadenamiento:
Patient + Practitioner + Location + Encounter + Observation + Condition.

Fase 6. Simular continuidad asistencial

Segundo Encounter en la sede de otro estudiante (Hospital S0Z)

Nuevas Observations

Consulta de historial por búsquedas FHIR

Esta parte debe cerrar con búsquedas tipo:

observaciones del paciente

encuentros del paciente

condiciones del paciente

recursos en una sede

atenciones de un profesional

Ahí el estudiante ve el “para qué”.

5. Recursos mínimos que yo incluiría en la clase 2

Si quieres que la práctica sea manejable y no excesiva, el conjunto mínimo ideal sería:

Organization

Location (por estudiante: Hospital S0Y)

Practitioner (médico del estudiante)

PractitionerRole (rol del médico en su `Location`/`Organization`)

Patient (paciente(s) que el estudiante registra)

Encounter (atención del estudiante en su sede)

Observation (signos vitales/u observaciones del estudiante, asociadas a Patient/Encounter)

Condition (motivo/diagnóstico registrado por el estudiante, asociada a Patient/Encounter)