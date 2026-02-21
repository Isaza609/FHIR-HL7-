import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getSlotsFree, getScheduleIdsByHealthcareService, DEFAULT_SCHEDULE_IDS } from "../services/slot";

/** Formatea start/end del Slot para mostrar (fecha y hora legibles) */
function formatSlotTime(start, end) {
  if (!start || !end) return { date: "", time: "" };
  try {
    const d = new Date(start);
    const dateStr = d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const startStr = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const endDate = new Date(end);
    const endStr = endDate.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return { date: dateStr, time: `${startStr} – ${endStr}` };
  } catch {
    return { date: start, time: end };
  }
}

export default function Disponibilidad() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const healthcareServiceId = searchParams.get("healthcareService");
  const locationId = searchParams.get("location");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const load = async () => {
      try {
        let scheduleIds = DEFAULT_SCHEDULE_IDS;
        if (healthcareServiceId) {
          const ids = await getScheduleIdsByHealthcareService(healthcareServiceId);
          if (ids.length > 0) scheduleIds = ids;
        }
        const bundle = await getSlotsFree(scheduleIds);
        const list = bundle.entry?.map((e) => e.resource) || [];
        setSlots(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [healthcareServiceId]);

  const handleElegir = (slot) => {
    navigate("/datos-paciente", {
      state: {
        slotId: slot.id,
        slotStart: slot.start,
        slotEnd: slot.end,
        scheduleRef: slot.schedule?.reference,
        healthcareServiceId,
        locationId,
        slotResource: slot,
      },
    });
  };

  return (
    <div className="pagina">
      <header className="header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Disponibilidad</p>
      </header>
      <main className="main">
        <Link to={`/servicios?location=${locationId || ""}`} className="back">← Volver a servicios</Link>
        <h2>Horarios disponibles</h2>
        {healthcareServiceId && <p className="info">Servicio: {healthcareServiceId}</p>}
        {loading && <p>Cargando slots…</p>}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && (
          <ul className="lista-slot">
            {slots.length === 0 ? (
              <li>No hay slots libres en este momento.</li>
            ) : (
              slots.map((slot) => {
                const { date, time } = formatSlotTime(slot.start, slot.end);
                return (
                  <li key={slot.id} className="slot-row">
                    <div className="slot-info">
                      <span className="slot-date">{date}</span>
                      <span className="slot-time">{time}</span>
                      <span className="slot-id">({slot.id})</span>
                    </div>
                    <button type="button" className="btn-elegir" onClick={() => handleElegir(slot)}>
                      Elegir
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
