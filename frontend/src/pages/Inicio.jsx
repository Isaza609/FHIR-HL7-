import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fhirGet } from "../services/fhir";

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
    // GET Location para nuestras sedes (datos reales del servidor FHIR)
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
        <p className="tagline">Agendamiento de citas</p>
      </header>
      <main className="main">
        <h2>Selecciona tu sede</h2>
        <p className="intro">Elige el punto de atención donde deseas solicitar la cita.</p>
        {loading && <p>Cargando sedes…</p>}
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
