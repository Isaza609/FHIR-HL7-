import React, { useMemo, useState } from "react";
import { apiGet, apiPost, apiPostJson, apiPutJson } from "./api";

type Health = { ok: boolean; fhirBaseUrl: string; namespace: string };
type Seed = { created: Record<string, string> };
type EncounterResp = { encounter: string; condition: string; observations: Record<string, string> };
type InteropSummary = {
  patient: string;
  encounters: unknown;
  observations: unknown;
  conditions: unknown;
  encounters_by_location_norte: unknown;
  encounters_by_location_sur: unknown;
  encounters_by_practitioner_laura: unknown;
  encounters_by_practitioner_carlos: unknown;
};

type FhirUpsertResponse = { resourceType: string; id: string; fullUrl?: string | null; resource: unknown };

function JsonBox({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        background: "#0b1020",
        color: "#e6e8ff",
        padding: 12,
        borderRadius: 8,
        overflow: "auto",
        maxHeight: 420
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [seed, setSeed] = useState<Seed | null>(null);
  const [first, setFirst] = useState<EncounterResp | null>(null);
  const [second, setSecond] = useState<EncounterResp | null>(null);
  const [summary, setSummary] = useState<InteropSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualResourceType, setManualResourceType] = useState("Patient");
  const [manualId, setManualId] = useState("");
  const [manualQuery, setManualQuery] = useState("subject=Patient/asmed-grupo-01-pat-maria-gomez");
  const [manualJson, setManualJson] = useState(
    JSON.stringify(
      {
        resourceType: "Patient",
        active: true,
        name: [{ family: "Gómez", given: ["María"] }],
        gender: "female"
      },
      null,
      2
    )
  );
  const [manualResult, setManualResult] = useState<unknown>(null);

  const stepsOk = useMemo(() => {
    return {
      health: !!health,
      seed: !!seed,
      first: !!first,
      second: !!second,
      summary: !!summary
    };
  }, [health, seed, first, second, summary]);

  async function run<T>(fn: () => Promise<T>, setter: (v: T) => void) {
    setBusy(true);
    setError(null);
    try {
      const v = await fn();
      setter(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function buildSearchUrl(resourceType: string, query: string) {
    const q = query.trim();
    return q ? `/api/fhir/${encodeURIComponent(resourceType)}?${q}` : `/api/fhir/${encodeURIComponent(resourceType)}`;
  }

  async function manualSearch() {
    const url = buildSearchUrl(manualResourceType, manualQuery);
    return await apiGet<unknown>(url);
  }

  async function manualRead() {
    const id = manualId.trim();
    if (!id) throw new Error("Ingresa un id para leer (GET ResourceType/id).");
    return await apiGet<unknown>(`/api/fhir/${encodeURIComponent(manualResourceType)}/${encodeURIComponent(id)}`);
  }

  async function manualCreate() {
    const parsed = JSON.parse(manualJson) as unknown;
    return await apiPostJson<FhirUpsertResponse>(`/api/fhir/${encodeURIComponent(manualResourceType)}`, parsed);
  }

  async function manualUpdate() {
    const id = manualId.trim();
    if (!id) throw new Error("Ingresa un id para actualizar (PUT ResourceType/id).");
    const parsed = JSON.parse(manualJson) as unknown;
    return await apiPutJson<FhirUpsertResponse>(`/api/fhir/${encodeURIComponent(manualResourceType)}/${encodeURIComponent(id)}`, parsed);
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>ASMED FHIR Lab</h1>
          <p className="muted">
            Plantilla FastAPI + React para practicar el flujo de <code>Flujo.md</code> contra un HAPI FHIR público.
          </p>
        </div>
      </header>

      <section className="card">
        <h2>1) Validación operativa (HAPI responde)</h2>
        <div className="row">
          <button disabled={busy} onClick={() => run(() => apiGet<Health>("/api/health"), setHealth)}>
            Probar backend
          </button>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                // capability statement (si falla, te lo mostrará en error)
                return await apiGet<unknown>("/api/fhir/metadata");
              }, () => {})
            }
          >
            Probar HAPI (/metadata)
          </button>
        </div>
        {health && (
          <div className="grid">
            <div>
              <div className="kpi">
                <div className="kpiLabel">FHIR_BASE_URL</div>
                <div className="kpiValue">{health.fhirBaseUrl}</div>
              </div>
            </div>
            <div>
              <div className="kpi">
                <div className="kpiLabel">FHIR_NAMESPACE</div>
                <div className="kpiValue">{health.namespace}</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>2) Bloque A — Contexto institucional (seed)</h2>
        <div className="row">
          <button disabled={busy} onClick={() => run(() => apiPost<Seed>("/api/seed"), setSeed)}>
            Crear Organization/Locations/Practitioners/Roles/Patient
          </button>
          <span className="pill">{stepsOk.seed ? "OK" : "pendiente"}</span>
        </div>
        {seed && <JsonBox value={seed} />}
      </section>

      <section className="card">
        <h2>3) Bloque B — Primer acto asistencial (Hospital Norte)</h2>
        <div className="row">
          <button disabled={busy} onClick={() => run(() => apiPost<EncounterResp>("/api/encounters/first"), setFirst)}>
            Crear Encounter + Condition + Vitals (Norte)
          </button>
          <span className="pill">{stepsOk.first ? "OK" : "pendiente"}</span>
        </div>
        {first && <JsonBox value={first} />}
      </section>

      <section className="card">
        <h2>4) Bloque C — Continuidad asistencial (Hospital Sur)</h2>
        <div className="row">
          <button disabled={busy} onClick={() => run(() => apiPost<EncounterResp>("/api/encounters/second"), setSecond)}>
            Crear Encounter + Condition + Vitals (Sur)
          </button>
          <span className="pill">{stepsOk.second ? "OK" : "pendiente"}</span>
        </div>
        {second && <JsonBox value={second} />}
      </section>

      <section className="card">
        <h2>5) Consultas de interoperabilidad (evidencia)</h2>
        <div className="row">
          <button disabled={busy} onClick={() => run(() => apiGet<InteropSummary>("/api/interop/summary"), setSummary)}>
            Ejecutar búsquedas (patient / sedes / profesionales)
          </button>
          <span className="pill">{stepsOk.summary ? "OK" : "pendiente"}</span>
        </div>
        {summary && <JsonBox value={summary} />}
      </section>

      <section className="card">
        <h2>6) Consola manual (crear / leer / buscar)</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Aquí los estudiantes pueden ingresar datos y hacer consultas manuales para entender referencias y búsquedas FHIR (sin “magia”).
        </p>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="card" style={{ marginTop: 0 }}>
            <h2 style={{ marginBottom: 8 }}>A) Parámetros</h2>
            <div className="field">
              <label>ResourceType</label>
              <input value={manualResourceType} onChange={(e) => setManualResourceType(e.target.value)} placeholder="Patient / Encounter / Observation / Condition ..." />
            </div>
            <div className="field">
              <label>ID (para GET/PUT)</label>
              <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="asmed-g01-pat-maria-gomez" />
            </div>
            <div className="field">
              <label>Query string (para búsqueda)</label>
              <input value={manualQuery} onChange={(e) => setManualQuery(e.target.value)} placeholder="subject=Patient/123&location=Location/abc" />
              <div className="help">
                Endpoint: <code>{buildSearchUrl(manualResourceType, manualQuery)}</code>
              </div>
            </div>
            <div className="row">
              <button disabled={busy} onClick={() => run(() => manualSearch(), setManualResult)}>
                Buscar (GET)
              </button>
              <button disabled={busy} onClick={() => run(() => manualRead(), setManualResult)}>
                Leer por ID (GET)
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 0 }}>
            <h2 style={{ marginBottom: 8 }}>B) JSON del recurso</h2>
            <div className="field">
              <label>Body (JSON)</label>
              <textarea value={manualJson} onChange={(e) => setManualJson(e.target.value)} rows={14} spellCheck={false} />
              <div className="help">
                Tip: para actualizar, pon el <code>id</code> en el campo de arriba; el backend lo forzará coherente con la ruta.
              </div>
            </div>
            <div className="row">
              <button disabled={busy} onClick={() => run(() => manualCreate(), setManualResult)}>
                Crear (POST)
              </button>
              <button disabled={busy} onClick={() => run(() => manualUpdate(), setManualResult)}>
                Actualizar (PUT)
              </button>
            </div>
          </div>
        </div>

        {manualResult && (
          <div style={{ marginTop: 10 }}>
            <JsonBox value={manualResult} />
          </div>
        )}
      </section>

      {error && (
        <section className="card error">
          <h2>Error</h2>
          <pre>{error}</pre>
        </section>
      )}

      <footer className="footer muted">
        <div>
          Sugerencia: cambia <code>FHIR_NAMESPACE</code> en <code>backend/.env</code> por grupo para evitar colisiones en HAPI público.
        </div>
      </footer>
    </div>
  );
}

