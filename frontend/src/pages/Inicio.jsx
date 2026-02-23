import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { USE_MOCK_DATA } from "../config";
import { MOCK_LOCATIONS } from "../data/mockData";
import { getLocations } from "../services/location";
import LoadingSpinner from "../components/LoadingSpinner";
import { Icon } from "../components/Icons";
import ReqNote from "../components/ReqNote";

function getIdentifierValue(location) {
  const id = location.identifier?.[0];
  return id?.value || "";
}

export default function Inicio() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (USE_MOCK_DATA) {
      setSedes(MOCK_LOCATIONS);
      setLoading(false);
      return;
    }
    getLocations()
      .then(setSedes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="inicio">
      <header className="header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Agenda interoperable de citas</p>
        <Link to="/operador" className="operador-link">Acceso operador (Call Center)</Link>
      </header>
      <main className="main" role="main" id="main-content">
        <section className="hero">
          <h2><Icon name="location" /> ¿Dónde te atendemos?</h2>
          <p className="intro">Elige la sede más cercana para agendar tu cita de forma rápida y segura.</p>
          <ReqNote num={5}>Un servidor central FHIR recibe las solicitudes de citas (Appointment) de todos los canales (web, Call Center, app, HIS) para mantener el control centralizado de agendas (Schedule).</ReqNote>
        </section>
        <div role="status" aria-live="polite" aria-atomic="true">
          {loading && (
            <p className="loading-block">
              <LoadingSpinner aria-label="Cargando sedes" />
              Cargando sedes…
            </p>
          )}
          {error && <p className="error">Error al cargar sedes: {error}</p>}
          {!loading && !error && (
            <div className="sedes-grid">
              {sedes.length === 0 ? (
                <p>No hay sedes disponibles. Asegúrate de tener los recursos Location cargados en el servidor FHIR.</p>
              ) : (
                sedes.map((sede) => (
                  <Link
                    key={sede.id}
                    to={`/servicios?location=${sede.id}`}
                    className="sede-card"
                    aria-label={`Sede ${sede.name || sede.id}, ir a servicios`}
                  >
                    <span className="sede-name"><Icon name="location" /> {sede.name || sede.id}</span>
                    <span className="sede-id">ID: {getIdentifierValue(sede) || sede.id}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
