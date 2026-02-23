import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getSlotsFree, getScheduleIdsByHealthcareService, DEFAULT_SCHEDULE_IDS } from "../services/slot";
import { USE_MOCK_DATA } from "../config";
import { MOCK_SLOTS } from "../data/mockData";
import PageLayout from "../components/PageLayout";
import SlotList from "../components/SlotList";
import LoadingSpinner from "../components/LoadingSpinner";
import { Icon } from "../components/Icons";
import ReqNote from "../components/ReqNote";

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
    if (USE_MOCK_DATA) {
      setSlots(MOCK_SLOTS);
      setLoading(false);
      return;
    }
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
    <PageLayout
      tagline="Disponibilidad"
      backTo={`/servicios?location=${locationId || ""}`}
      backLabel="Volver a servicios"
    >
      <h2><Icon name="calendar" /> Horarios disponibles</h2>
      <ReqNote num={4}>Cuando el paciente solicita una cita (Appointment) se registra un espacio de tiempo (Slot) dentro de la agenda (Schedule) correspondiente.</ReqNote>
      {healthcareServiceId && <p className="info">Servicio: {healthcareServiceId}</p>}
      <div role="status" aria-live="polite" aria-atomic="true">
        {loading && (
          <p className="loading-block">
            <LoadingSpinner aria-label="Cargando disponibilidad" />
            Cargando disponibilidad…
          </p>
        )}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && (
          <SlotList slots={slots} onChoose={handleElegir} buttonLabel="Elegir" />
        )}
      </div>
    </PageLayout>
  );
}
