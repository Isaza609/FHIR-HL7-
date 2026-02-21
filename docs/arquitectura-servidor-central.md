# Arquitectura – Servidor FHIR central (RNF-02)

## Flujo centralizado

Todos los canales envían solicitudes al mismo servidor FHIR. No hay réplicas de agenda por canal.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Sitio     │  │ Call        │  │  App        │  │  HIS        │
│   Web       │  │ Center      │  │  Móvil      │  │ (Ventanilla)│
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       │   HTTP/REST (FHIR R4)           │                │
       └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     Servidor FHIR central     │
                    │  (Schedule / Slot / Appointment)│
                    └───────────────────────────────┘
```

## Esquema Canal → FHIR Server → Schedule/Slot → Appointment

1. **Canal** → solicita disponibilidad: `GET /Slot?schedule=...&status=free`
2. **FHIR Server** → devuelve Slot disponibles
3. **Canal** → crea cita: `POST /Appointment` (referenciando Slot y participantes)
4. **FHIR Server** → persiste Appointment, actualiza Slot a `busy`, devuelve `AppointmentResponse`

Todos los canales consumen los mismos recursos; el modelo de datos no cambia por canal (RNF-06).
