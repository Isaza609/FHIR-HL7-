import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSlotsFree, getScheduleIdsByHealthcareService, DEFAULT_SCHEDULE_IDS } from "../../services/slot";
import { USE_MOCK_DATA } from "../../config";
import { MOCK_LOCATIONS, MOCK_HEALTHCARE_SERVICES, MOCK_SLOTS } from "../../data/mockData";

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

export default function OperadorDisponibilidad() {
  const navigate = useNavigate();
  const [locationId, setLocationId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const services = locationId ? (MOCK_HEALTHCARE_SERVICES[locationId] || []) : [];

  useEffect(() => {
    if (!locationId) {
      setSlots([]);
      setServiceId("");
      return;
    }
    setServiceId("");
    setSlots([]);
  }, [locationId]);

  useEffect(() => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    if (USE_MOCK_DATA) {
      setSlots(MOCK_SLOTS);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        let scheduleIds = DEFAULT_SCHEDULE_IDS;
        if (serviceId) {
          const ids = await getScheduleIdsByHealthcareService(serviceId);
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
  }, [locationId, serviceId]);

  const handleElegir = (slot) => {
    navigate("/operador/agendar", {
      state: {
        slotId: slot.id,
        slotStart: slot.start,
        slotEnd: slot.end,
        scheduleRef: slot.schedule?.reference,
        healthcareServiceId: serviceId || null,
        locationId,
        slotResource: slot,
      },
    });
  };

  return (
    <>
      <h2>Consulta de disponibilidad</h2>
      <p className="intro">Seleccione sede y servicio para ver slots libres. Elija un horario para registrar una cita.</p>
      <div className="operador-filtros">
        <div className="form-group">
          <label htmlFor="operador-sede">Sede</label>
          <select
            id="operador-sede"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">— Seleccione sede —</option>
            {MOCK_LOCATIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="operador-servicio">Servicio</label>
          <select
            id="operador-servicio"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={!locationId}
          >
            <option value="">— Todos / cualquiera —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      {locationId && (
        <>
          {loading && <p>Cargando slots…</p>}
          {error && <p className="error">Error: {error}</p>}
          {!loading && !error && (
            <ul className="lista-slot">
              {slots.length === 0 ? (
                <li>No hay slots libres para los criterios seleccionados.</li>
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
                        Elegir para agendar
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </>
      )}
      <p className="back-block">
        <a href="/">← Volver al sitio público</a>
      </p>
    </>
  );
}
