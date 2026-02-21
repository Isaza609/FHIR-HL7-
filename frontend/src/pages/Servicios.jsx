import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fhirGet } from "../services/fhir";

const SEDE_NAMES = {
  "loc-norte": "Clínica Norte",
  "loc-centro": "Clínica Centro",
  "loc-sur": "Clínica Sur",
};

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
    const ref = `Location/${locationId}`;
    fhirGet(`HealthcareService?location=${encodeURIComponent(ref)}`)
      .then((bundle) => {
        const list = bundle.entry?.map((e) => e.resource) || [];
        setServices(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [locationId]);

  const sedeName = SEDE_NAMES[locationId] || locationId;

  return (
    <div className="pagina">
      <header className="header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Selección de servicio</p>
      </header>
      <main className="main">
        <Link to="/" className="back">← Volver a sedes</Link>
        <h2>Servicios en {sedeName}</h2>
        {!locationId && (
          <p>Selecciona primero una sede en <Link to="/">Inicio</Link>.</p>
        )}
        {locationId && loading && <p>Cargando servicios…</p>}
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
                  >
                    {hs.name || hs.id}
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
