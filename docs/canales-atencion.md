# Canales de atención (RNF-06 – Soporte multicanal)

| Canal | Recurso que envía | Recurso que recibe |
|-------|-------------------|--------------------|
| Sitio web | GET Slot (consulta), POST Appointment (agendar), PATCH Appointment (cancelar) | Slot[], Appointment, AppointmentResponse |
| Call Center | Idem | Idem |
| App móvil | Idem | Idem |
| HIS (Ventanilla) | Idem | Idem |

El modelo FHIR (Schedule, Slot, Appointment, AppointmentResponse) es el mismo para todos los canales; solo cambia la interfaz de usuario.
