# Recursos FHIR R4 – ACME Salud

Recursos en formato JSON según **HL7 FHIR R4** y atributos mínimos definidos en `docs_plan/4. Atributos mínimos de los recursos FHIR utilizados.md`.

## Orden de carga

Para evitar referencias rotas, cargar en este orden (el script `scripts/cargar_recursos.py` lo respeta):

1. Organization  
2. Location  
3. HealthcareService  
4. Practitioner  
5. PractitionerRole  
6. Patient  
7. Coverage  
8. Schedule  
9. Slot  

Appointment y AppointmentResponse se crean durante el flujo de agendamiento (no es necesario cargarlos por defecto).

## Convención de IDs

Ver `config/convencion-identificadores.md`.
