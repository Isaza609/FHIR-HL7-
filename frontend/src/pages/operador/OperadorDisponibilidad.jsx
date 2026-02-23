import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSlotsFree, getScheduleIdsByHealthcareService, DEFAULT_SCHEDULE_IDS } from "../../services/slot";
import { getLocations, getHealthcareServicesByLocation } from "../../services/location";
import { USE_MOCK_DATA } from "../../config";
import { MOCK_LOCATIONS, MOCK_HEALTHCARE_SERVICES, MOCK_SLOTS } from "../../data/mockData";
import SlotList from "../../components/SlotList";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function OperadorDisponibilidad() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const servicesList = USE_MOCK_DATA
    ? (locationId ? (MOCK_HEALTHCARE_SERVICES[locationId] || []) : [])
    : services;

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    getLocations()
      .then(setLocations)
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    if (!locationId) {
      setServices([]);
      setServiceId("");
      setSlots([]);
      return;
    }
    setServiceId("");
    setSlots([]);
    if (USE_MOCK_DATA) return;
    getHealthcareServicesByLocation(locationId)
      .then(setServices)
      .catch(() => setServices([]));
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
        let scheduleIds = [...DEFAULT_SCHEDULE_IDS];
        if (serviceId) {
          const ids = await getScheduleIdsByHealthcareService(serviceId);
          if (ids.length > 0) scheduleIds = [...new Set([...ids, ...DEFAULT_SCHEDULE_IDS])];
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

  const locationsList = USE_MOCK_DATA ? MOCK_LOCATIONS : locations;

  return (
    <>
      <h2>Consulta de disponibilidad</h2>
      <p className="intro">Seleccione sede y servicio para ver horarios libres. Elija un slot para registrar una cita.</p>
      <div className="operador-filtros">
        <div className="form-group">
          <label htmlFor="operador-sede">Sede</label>
          <select
            id="operador-sede"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            aria-describedby="operador-status"
          >
            <option value="">— Seleccione sede —</option>
            {locationsList.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.id}</option>
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
            aria-describedby="operador-status"
          >
            <option value="">— Todos / cualquiera —</option>
            {servicesList.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.id}</option>
            ))}
          </select>
        </div>
      </div>
      <div id="operador-status" role="status" aria-live="polite" aria-atomic="true">
        {locationId && loading && (
          <p className="loading-block">
            <LoadingSpinner aria-label="Cargando disponibilidad" />
            Cargando disponibilidad…
          </p>
        )}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && locationId && slots.length === 0 && (
          <p className="info">
            No hay horarios disponibles. Si usas el servidor FHIR público (HAPI), carga antes los recursos: <code>python scripts/cargar_recursos.py</code>
          </p>
        )}
        {!loading && !error && locationId && slots.length > 0 && (
          <SlotList slots={slots} onChoose={handleElegir} buttonLabel="Elegir para agendar" />
        )}
      </div>
      <p className="back-block">
        <Link to="/">← Volver al sitio público</Link>
      </p>
    </>
  );
}
