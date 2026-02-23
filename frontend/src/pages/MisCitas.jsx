import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { fhirGet } from "../services/fhir";
import { getPractitionerRoleRefFromAppointment } from "../services/appointment";
import { getCoverageForPatient } from "../services/coverage";
import { USE_MOCK_DATA } from "../config";
import { MOCK_PATIENTS, MOCK_APPOINTMENTS_BY_PATIENT } from "../data/mockData";
import PageLayout from "../components/PageLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { Icon } from "../components/Icons";

export default function MisCitas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);
  const [coverageInfo, setCoverageInfo] = useState({ aseguradoraName: "", coverageRef: null, payorRef: null });

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
      setAppointments([]);
      return;
    }
    if (USE_MOCK_DATA) {
      setLoadingAppointments(true);
      setError(null);
      setAppointments(MOCK_APPOINTMENTS_BY_PATIENT[patientId] || []);
      setLoadingAppointments(false);
      return;
    }
    setLoadingAppointments(true);
    setError(null);
    const ref = `Patient/${patientId}`;
    fhirGet(`Appointment?actor=${encodeURIComponent(ref)}`)
      .then((bundle) => {
        const list = bundle.entry?.map((e) => e.resource) || [];
        setAppointments(list);
      })
      .catch((err) => {
        setError(err.message);
        setAppointments([]);
      })
      .finally(() => setLoadingAppointments(false));
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      setCoverageInfo({ aseguradoraName: "", coverageRef: null, payorRef: null });
      return;
    }
    if (USE_MOCK_DATA) {
      const p = patients.find((x) => x.id === patientId);
      setCoverageInfo({
        aseguradoraName: p?.aseguradoraName || "",
        coverageRef: p?.coverageRef || null,
        payorRef: p?.payorRef || null,
      });
      return;
    }
    getCoverageForPatient(patientId).then((c) => setCoverageInfo({ aseguradoraName: c.aseguradoraName, coverageRef: c.coverageId ? `Coverage/${c.coverageId}` : null, payorRef: c.payorRef }));
  }, [patientId, patients]);

  const handleCancelar = (appointment) => {
    navigate("/cancelar-cita", { state: { appointmentId: appointment.id, appointment } });
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString("es-CO") : "");
  const locationState = location?.state || {};
  const { cancelled: cancelledId, cancellationReason, cancellationReasonDisplay } = locationState;

  return (
    <PageLayout tagline="Mis citas" backTo="/" backLabel="Volver al inicio">
      <h2><Icon name="calendar" /> Mis citas</h2>
      <p className="intro">Consulta y gestiona tus citas agendadas.</p>
      {cancelledId && (
        <div className="req-section" role="status">
          <p className="confirmacion-ok" style={{ marginBottom: 0 }}>
            Cita cancelada (Req. 7). <strong>Appointment.status</strong> = cancelled · <strong>Appointment.cancellationReason</strong> = {cancellationReasonDisplay || cancellationReason || "registrado"}
          </p>
        </div>
      )}
      <div className="form-group" style={{ maxWidth: "20rem", marginBottom: "1.5rem" }}>
        <label htmlFor="patient">Ver citas del paciente</label>
        <select id="patient" value={patientId} onChange={(e) => setPatientId(e.target.value)} disabled={loading} aria-describedby="citas-status">
          <option value="">Seleccione paciente</option>
          {patients.map((p) => {
            const name = p.name?.[0];
            const text = name ? [name.given?.join(" "), name.family].filter(Boolean).join(" ") : p.id;
              const cov = p.aseguradoraName ? ` · ${p.aseguradoraName}` : "";
              return <option key={p.id} value={p.id}>{text || p.id}{cov}</option>;
          })}
        </select>
      </div>
      {patientId && (coverageInfo.aseguradoraName || coverageInfo.payorRef) && (
        <div className="coverage-block">
          <strong>Cobertura (Coverage) – Req. 3:</strong> {coverageInfo.aseguradoraName}
          {coverageInfo.coverageRef && <span className="ref-inline"> · {coverageInfo.coverageRef}</span>}
          {coverageInfo.payorRef && <span className="ref-inline"> · Aseguradora (Organization): <code>{coverageInfo.payorRef}</code></span>}
        </div>
      )}
      <div id="citas-status" role="status" aria-live="polite" aria-atomic="true">
        {error && <p className="error">{error}</p>}
        {loadingAppointments && (
          <p className="loading-block">
            <LoadingSpinner aria-label="Cargando citas" />
            Cargando citas…
          </p>
        )}
        {!loadingAppointments && patientId && (
          <ul className="lista-slot">
            {appointments.length === 0 ? (
              <li>No hay citas para este paciente.</li>
            ) : (
              appointments
                .filter((a) => a.status !== "cancelled")
                .map((appt) => {
                  const prRef = appt.practitionerRoleRef || getPractitionerRoleRefFromAppointment(appt);
                  const prName = appt.practitionerName;
                  return (
                    <li key={appt.id} className="slot-row">
                      <div className="slot-info">
                        <span className="slot-date">{formatDate(appt.start)} – {formatDate(appt.end)}</span>
                        <span className="slot-time">
                          Cita {appt.id} · {appt.status}
                          {(prName || prRef) && (
                            <> · Con: {prName || prRef} {prRef && prName && <span className="slot-id">({prRef})</span>}</>
                          )}
                        </span>
                      </div>
                      <button type="button" className="btn-cancelar" onClick={() => handleCancelar(appt)} aria-label={`Cancelar cita ${appt.id}`}>
                        <Icon name="cancel" /> Cancelar cita
                      </button>
                    </li>
                  );
                })
            )}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}
