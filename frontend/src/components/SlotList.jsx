/**
 * Lista de slots con fecha/hora formateada y botón de acción.
 * Reutilizable en flujo paciente y operador.
 */
export function formatSlotTime(start, end) {
  if (!start || !end) return { date: "", time: "" };
  try {
    const d = new Date(start);
    const dateStr = d.toLocaleDateString("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const startStr = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const endDate = new Date(end);
    const endStr = endDate.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return { date: dateStr, time: `${startStr} – ${endStr}` };
  } catch {
    return { date: start, time: end };
  }
}

export default function SlotList({ slots, onChoose, buttonLabel = "Elegir", showSlotId = true }) {
  if (!slots || slots.length === 0) {
    return (
      <ul className="lista-slot" aria-label="Horarios disponibles">
        <li>No hay horarios disponibles en este momento.</li>
      </ul>
    );
  }
  return (
    <ul className="lista-slot" aria-label="Horarios disponibles">
      {slots.map((slot) => {
        const { date, time } = formatSlotTime(slot.start, slot.end);
        return (
          <li key={slot.id} className="slot-row">
            <div className="slot-info">
              <span className="slot-date">{date}</span>
              <span className="slot-time">{time}</span>
              {showSlotId && <span className="slot-id">({slot.id})</span>}
            </div>
            <button
              type="button"
              className="btn-elegir"
              onClick={() => onChoose(slot)}
              aria-label={`Elegir horario ${date} ${time}`}
            >
              {buttonLabel}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
