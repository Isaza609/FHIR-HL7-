# Convención de identificadores (RNF-05 – Trazabilidad)

Todos los recursos deben tener un `id` único y referenciable.

| Recurso            | Prefijo     | Ejemplo                          |
|--------------------|------------|-----------------------------------|
| Organization       | org-       | org-acme-salud, org-aseguradora-salud-completa |
| Location           | loc-       | loc-norte, loc-centro, loc-sur    |
| HealthcareService  | hs-        | hs-pediatria-norte, hs-nefrologia-centro |
| Practitioner       | prac-      | prac-gregorio-casas               |
| PractitionerRole   | pr-        | pr-casas-pediatria-norte          |
| Patient            | pat-       | pat-001, pat-ejemplo              |
| Coverage           | cov-       | cov-001                          |
| Schedule           | sched-     | sched-hs-pediatria-2025-02       |
| Slot               | slot-      | slot-001 (o UUID)                 |
| Appointment        | appt-      | appt-001                         |
| AppointmentResponse| apptresp- | apptresp-001                     |

Las referencias entre recursos usan el formato: `{ResourceType}/{id}` (ej. `Organization/org-acme-salud`).
