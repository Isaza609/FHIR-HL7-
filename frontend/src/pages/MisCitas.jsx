import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fhirGet } from "../services/fhir";

export default function MisCitas() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
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

  useEffect(() => {
    if (!patientId) {
      setAppointments([]);
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

  const handleCancelar = (appointment) => {
    navigate("/cancelar-cita", { state: { appointmentId: appointment.id, appointment } });
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString("es-CO") : "");

  return (
    <div className="pagina">
      <header className="header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Mis citas</p>
      </header>
      <main className="main">
        <Link to="/" className="back">← Volver al inicio</Link>
        <h2>Mis citas</h2>
        <div className="form-group" style={{ maxWidth: "20rem", marginBottom: "1.5rem" }}>
          <label htmlFor="patient">Ver citas del paciente</label>
          <select id="patient" value={patientId} onChange={(e) => setPatientId(e.target.value)} disabled={loading}>
            <option value="">Seleccione paciente</option>
            {patients.map((p) => {
              const name = p.name?.[0];
              const text = name ? [name.given?.join(" "), name.family].filter(Boolean).join(" ") : p.id;
              return <option key={p.id} value={p.id}>{text || p.id}</option>;
            })}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        {loadingAppointments && <p>Cargando citas…</p>}
        {!loadingAppointments && patientId && (
          <ul className="lista-slot">
            {appointments.length === 0 ? (
              <li>No hay citas para este paciente.</li>
            ) : (
              appointments
                .filter((a) => a.status !== "cancelled")
                .map((appt) => (
                  <li key={appt.id} className="slot-row">
                    <div className="slot-info">
                      <span className="slot-date">{formatDate(appt.start)} – {formatDate(appt.end)}</span>
                      <span className="slot-time">Cita {appt.id} · {appt.status}</span>
                    </div>
                    <button type="button" className="btn-cancelar" onClick={() => handleCancelar(appt)}>
                      Cancelar cita
                    </button>
                  </li>
                ))
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
