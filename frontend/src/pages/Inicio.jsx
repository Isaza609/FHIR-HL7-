import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fhirGet } from "../services/fhir";
import { USE_MOCK_DATA } from "../config";
import { MOCK_LOCATIONS } from "../data/mockData";

/** IDs de Location de ACME (sedes) – coinciden con config/filtros-servidor-publico.json */
const LOCATION_IDS = ["loc-norte", "loc-centro", "loc-sur"];

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
    const idParam = LOCATION_IDS.join(",");
    fhirGet(`Location?_id=${idParam}`)
      .then((bundle) => {
        const list = bundle.entry?.map((e) => e.resource) || [];
        setSedes(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="inicio">
      <header className="header">
        <h1 className="logo">ACME Salud</h1>
        <p className="tagline">Agenda interoperable de citas</p>
        <Link to="/operador" className="operador-link">Acceso operador (Call Center)</Link>
      </header>
      <main className="main">
        <section className="hero">
          <h2>¿Dónde te atendemos?</h2>
          <p className="intro">Elige la sede más cercana para agendar tu cita de forma rápida y segura.</p>
        </section>
        {loading && <p className="loading-msg">Cargando sedes…</p>}
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
                >
                  <span className="sede-name">{sede.name || sede.id}</span>
                  <span className="sede-id">ID: {getIdentifierValue(sede) || sede.id}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
