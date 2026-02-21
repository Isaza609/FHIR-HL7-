import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fhirGet } from "../services/fhir";
import { createAppointmentAndReserveSlot, getPractitionerRoleForSlot } from "../services/appointment";

const TIPOS_CONSULTA = [
  { value: "primera-vez-medicina-general", label: "Primera vez – Medicina general", code: "124", display: "Primera vez Medicina general" },
  { value: "primera-vez-especializada", label: "Primera vez – Consulta especializada", code: "125", display: "Primera vez Consulta especializada" },
  { value: "control-medicina-general", label: "Control – Medicina general", code: "126", display: "Control Medicina general" },
  { value: "control-especializada", label: "Control – Consulta especializada", code: "57", display: "Control Consulta especializada" },
  { value: "control-telemedicina-general", label: "Control – Telemedicina (Medicina general)", code: "127", display: "Control Telemedicina general" },
  { value: "control-telemedicina-especializada", label: "Control – Telemedicina (Consulta especializada)", code: "128", display: "Control Telemedicina especializada" },
];

export default function DatosPaciente() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { slotId, slotStart, slotEnd, slotResource, healthcareServiceId, locationId } = state;

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [tipoConsulta, setTipoConsulta] = useState(TIPOS_CONSULTA[0].value);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fhirGet("Patient?_count=50")
      .then((bundle) => {
        const list = bundle.entry?.map((e) => e.resource) || [];
        setPatients(list);
        if (list.length > 0 && !patientId) setPatientId(list[0].id);
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slotId || !slotResource || !patientId) {
      setError("Faltan datos del slot o paciente.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const practitionerRoleRef = await getPractitionerRoleForSlot(slotResource);
      const tipo = TIPOS_CONSULTA.find((t) => t.value === tipoConsulta) || TIPOS_CONSULTA[0];
      const { appointmentId } = await createAppointmentAndReserveSlot({
        slotId,
        slotResource,
        patientId,
        practitionerRoleRef,
        start: slotStart,
        end: slotEnd,
        serviceTypeCode: tipo.code,
        serviceTypeDisplay: tipo.display,
      });
      navigate("/confirmacion", {
        state: {
          slotStart,
          slotEnd,
          patientId,
          tipoConsulta: tipo.label,
          servicio: tipo.display,
          appointmentId,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!slotId || !slotResource) {
    return (
      <div className="pagina">
        <header className="header">
          <Link to="/" className="logo">ACME Salud</Link>
          <p className="tagline">Datos para la cita</p>
        </header>
        <main className="main">
          <p>No se ha seleccionado un horario. <Link to="/">Volver al inicio</Link> y elige sede, servicio y un slot.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pagina">
      <header className="header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Datos para la cita</p>
      </header>
      <main className="main">
        <Link to={`/disponibilidad?healthcareService=${healthcareServiceId || ""}&location=${locationId || ""}`} className="back">← Volver a horarios</Link>
        <h2>Datos del paciente y tipo de consulta</h2>
        <p className="info">Horario elegido: {slotStart} – {slotEnd}</p>
        <form onSubmit={handleSubmit} className="form-cita">
          <div className="form-group">
            <label htmlFor="patient">Paciente</label>
            {loading ? (
              <p>Cargando pacientes…</p>
            ) : (
              <select id="patient" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">Seleccione un paciente</option>
                {patients.map((p) => {
                  const name = p.name?.[0];
                  const text = name ? [name.given?.join(" "), name.family].filter(Boolean).join(" ") : p.id;
                  return <option key={p.id} value={p.id}>{text || p.id}</option>;
                })}
              </select>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="tipo">Tipo de consulta</label>
            <select id="tipo" value={tipoConsulta} onChange={(e) => setTipoConsulta(e.target.value)} required>
              {TIPOS_CONSULTA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={submitting || loading}>
            {submitting ? "Agendando…" : "Confirmar y agendar cita"}
          </button>
        </form>
      </main>
    </div>
  );
}
