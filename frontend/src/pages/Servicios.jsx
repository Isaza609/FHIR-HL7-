import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { USE_MOCK_DATA } from "../config";
import { MOCK_LOCATIONS, MOCK_HEALTHCARE_SERVICES } from "../data/mockData";
import { getHealthcareServicesByLocation } from "../services/location";
import PageLayout from "../components/PageLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { Icon } from "../components/Icons";
import ReqNote from "../components/ReqNote";

const SEDE_NAMES = Object.fromEntries((MOCK_LOCATIONS || []).map((s) => [s.id, s.name]));
SEDE_NAMES["loc-norte"] = SEDE_NAMES["loc-norte"] || "Clínica Norte";
SEDE_NAMES["loc-centro"] = SEDE_NAMES["loc-centro"] || "Clínica Centro";
SEDE_NAMES["loc-sur"] = SEDE_NAMES["loc-sur"] || "Clínica Sur";

export default function Servicios() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("location") || "";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    if (USE_MOCK_DATA) {
      setServices(MOCK_HEALTHCARE_SERVICES[locationId] || []);
      setLoading(false);
      return;
    }
    getHealthcareServicesByLocation(locationId)
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [locationId]);

  const sedeName = SEDE_NAMES[locationId] || locationId;

  return (
    <PageLayout tagline="Selección de servicio" backTo="/" backLabel="Volver a sedes">
      <h2><Icon name="service" /> Servicios en {sedeName}</h2>
      <p className="intro">Elige el tipo de atención que necesitas.</p>
      <ReqNote num={1}>Cada servicio especializado (HealthcareService) tiene su propia agenda (Schedule) definida mensualmente.</ReqNote>
      <ReqNote num={2}>Cada médico especialista (Practitioner), en su rol como empleado (PractitionerRole) de ACME Salud, tiene su propia agenda (Schedule) definida mensualmente.</ReqNote>
      {!locationId && (
        <p>Selecciona primero una sede en <Link to="/">Inicio</Link>.</p>
      )}
      <div role="status" aria-live="polite" aria-atomic="true">
        {locationId && loading && (
          <p className="loading-block">
            <LoadingSpinner aria-label="Cargando servicios" />
            Cargando servicios…
          </p>
        )}
        {locationId && error && <p className="error">Error: {error}</p>}
        {locationId && !loading && !error && (
          <ul className="lista-servicios">
            {services.length === 0 ? (
              <li>No hay servicios registrados para esta sede.</li>
            ) : (
              services.map((hs) => (
                <li key={hs.id}>
                  <Link
                    to={`/disponibilidad?healthcareService=${hs.id}&location=${locationId}`}
                    className="servicio-link"
                    aria-label={`Servicio ${hs.name || hs.id}, ver horarios`}
                  >
                    <Icon name="service" /> {hs.name || hs.id}
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}
