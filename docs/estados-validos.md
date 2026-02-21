# Estados válidos (RNF-04 – Integridad de estados)

## Slot

| Estado | Significado |
|--------|-------------|
| `free` | Intervalo disponible para agendar |
| `busy` | Intervalo reservado por un Appointment activo |

## Appointment

| Estado | Significado |
|--------|-------------|
| `booked` | Cita confirmada y activa |
| `cancelled` | Cita cancelada (debe registrarse `cancellationReason`) |

## Coherencia

- Al **agendar**: Slot pasa de `free` → `busy`; Appointment se crea con `status = booked`.
- Al **cancelar**: Appointment pasa a `status = cancelled` y se registra `cancellationReason`; el Slot asociado vuelve a `status = free`.
