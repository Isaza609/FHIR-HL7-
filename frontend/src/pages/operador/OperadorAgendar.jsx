import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fhirGet } from "../../services/fhir";
import { createAppointmentAndReserveSlot, getPractitionerRoleForSlot, getPractitionerDisplayName } from "../../services/appointment";
import { getCoverageForPatient } from "../../services/coverage";
import { USE_MOCK_DATA } from "../../config";
import { MOCK_PATIENTS } from "../../data/mockData";

const TIPOS_CONSULTA = [
  { value: "primera-vez-medicina-general", label: "Primera vez – Medicina general", code: "124", display: "Primera vez Medicina general" },
  { value: "primera-vez-especializada", label: "Primera vez – Consulta especializada", code: "125", display: "Primera vez Consulta especializada" },
  { value: "control-medicina-general", label: "Control – Medicina general", code: "126", display: "Control Medicina general" },
  { value: "control-especializada", label: "Control – Consulta especializada", code: "57", display: "Control Consulta especializada" },
  { value: "control-telemedicina-general", label: "Control – Telemedicina (Medicina general)", code: "127", display: "Control Telemedicina general" },
  { value: "control-telemedicina-especializada", label: "Control – Telemedicina (Consulta especializada)", code: "128", display: "Control Telemedicina especializada" },
];

export default function OperadorAgendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { slotId, slotStart, slotEnd, slotResource, healthcareServiceId, locationId } = state;

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [coverageInfo, setCoverageInfo] = useState({ coverageId: null, payorRef: null, aseguradoraName: "" });
  const [tipoConsulta, setTipoConsulta] = useState(TIPOS_CONSULTA[0].value);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setPatients(MOCK_PATIENTS);
      if (MOCK_PATIENTS.length > 0 && !patientId) setPatientId(MOCK_PATIENTS[0].id);
      setLoading(false);
      return;
    }
    fhirGet("Patient?_count=50")
      .then((bundle) => {
        const list = bundle.entry?.map((e) => e.resource) || [];
        setPatients(list);
        if (list.length > 0 && !patientId) setPatientId(list[0].id);
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!patientId) {
      setCoverageInfo({ coverageId: null, payorRef: null, aseguradoraName: "" });
      return;
    }
    if (USE_MOCK_DATA) {
      const p = patients.find((x) => x.id === patientId);
      setCoverageInfo({
        coverageId: p?.coverageRef?.replace("Coverage/", "") || null,
        payorRef: p?.payorRef || null,
        aseguradoraName: p?.aseguradoraName || "",
      });
      return;
    }
    getCoverageForPatient(patientId).then(setCoverageInfo);
  }, [patientId, patients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slotId || !slotResource || !patientId) {
      setError("Faltan datos del slot o paciente.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        const tipo = TIPOS_CONSULTA.find((t) => t.value === tipoConsulta) || TIPOS_CONSULTA[0];
        navigate("/operador/agendar/confirmacion", {
          state: {
            slotStart,
            slotEnd,
            patientId,
            tipoConsulta: tipo.label,
            servicio: tipo.display,
            appointmentId: "appt-mock-" + Date.now(),
            practitionerName: "Diego Narváez (ejemplo)",
            practitionerRoleRef: "PractitionerRole/pr-narvaez-oncologia-sur",
            slotId,
            patientRef: patientId ? `Patient/${patientId}` : null,
            comentarios: "Cita programada según disponibilidad de la agenda.",
            aseguradoraName: coverageInfo.aseguradoraName,
            coverageRef: coverageInfo.coverageId ? `Coverage/${coverageInfo.coverageId}` : null,
            payorRef: coverageInfo.payorRef,
          },
        });
        setSubmitting(false);
        return;
      }
      const practitionerRoleRef = await getPractitionerRoleForSlot(slotResource);
      const practitionerName = await getPractitionerDisplayName(practitionerRoleRef);
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
      navigate("/operador/agendar/confirmacion", {
        state: {
          slotStart,
          slotEnd,
          patientId,
          tipoConsulta: tipo.label,
          servicio: tipo.display,
          appointmentId,
          practitionerName: practitionerName || "Asignado según agenda",
          slotId,
          practitionerRoleRef,
          patientRef: patientId ? `Patient/${patientId}` : null,
          aseguradoraName: coverageInfo.aseguradoraName,
          coverageRef: coverageInfo.coverageId ? `Coverage/${coverageInfo.coverageId}` : null,
          payorRef: coverageInfo.payorRef,
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
      <>
        <h2>Registro de cita</h2>
        <p>Debe elegir primero un horario en la pestaña <Link to="/operador/disponibilidad">Disponibilidad</Link>.</p>
        <p className="back-block"><Link to="/operador/disponibilidad">Ir a disponibilidad</Link></p>
      </>
    );
  }

  return (
    <>
      <h2>Registro de cita</h2>
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
                const cov = p.aseguradoraName ? ` · ${p.aseguradoraName}` : "";
                return <option key={p.id} value={p.id}>{text || p.id}{cov}</option>;
              })}
            </select>
          )}
        </div>
        {patientId && (coverageInfo.aseguradoraName || coverageInfo.payorRef) && (
          <div className="coverage-block">
            <strong>Cobertura (Coverage)</strong> – Req. 3: {coverageInfo.aseguradoraName}
            {coverageInfo.coverageId && <span className="ref-inline"> · Coverage/{coverageInfo.coverageId}</span>}
            {coverageInfo.payorRef && <span className="ref-inline"> · Aseguradora (Organization): <code>{coverageInfo.payorRef}</code></span>}
          </div>
        )}
        {patientId && !coverageInfo.aseguradoraName && !coverageInfo.payorRef && (
          <p className="info">Este paciente no tiene cobertura (Coverage) registrada.</p>
        )}
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
      <p className="back-block"><Link to="/operador/disponibilidad">← Volver a disponibilidad</Link></p>
    </>
  );
}
