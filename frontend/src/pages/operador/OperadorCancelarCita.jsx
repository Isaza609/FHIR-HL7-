import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { cancelAppointment } from "../../services/appointment";
import { USE_MOCK_DATA } from "../../config";
import ReqNote from "../../components/ReqNote";

const MOTIVOS = [
  { value: "pat", label: "Paciente (solicitud del paciente)" },
  { value: "prov", label: "Prestador (por el médico o institución)" },
  { value: "pat-crs", label: "Paciente – Enfermedad" },
  { value: "pat-mt", label: "Paciente – Mudanza" },
];

export default function OperadorCancelarCita() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { appointmentId, appointment } = state;

  const [motivo, setMotivo] = useState("pat");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentId) return;
    setSubmitting(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        const m = MOTIVOS.find((x) => x.value === motivo) || MOTIVOS[0];
        navigate("/operador/cancelar", { state: { cancelled: appointmentId, cancellationReason: m.value, cancellationReasonDisplay: m.label } });
        setSubmitting(false);
        return;
      }
      const m = MOTIVOS.find((x) => x.value === motivo) || MOTIVOS[0];
      await cancelAppointment(appointmentId, m.value, m.label);
      navigate("/operador/cancelar", { state: { cancelled: appointmentId, cancellationReason: m.value, cancellationReasonDisplay: m.label } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointmentId) {
    return (
      <>
        <h2>Cancelar cita</h2>
        <p>No se ha seleccionado una cita. <Link to="/operador/cancelar">Volver a búsqueda de citas</Link>.</p>
      </>
    );
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleString("es-CO") : "");

  return (
    <>
      <h2>Confirmar cancelación</h2>
      <ReqNote num={7}>Al cancelar: se actualiza Appointment.status = cancelled y Appointment.cancellationReason.</ReqNote>
      <p className="info">Cita (Appointment): {appointmentId} · {formatDate(appointment?.start)} – {formatDate(appointment?.end)}</p>
      <form onSubmit={handleSubmit} className="form-cita">
        <div className="form-group">
          <label htmlFor="motivo">Motivo (Appointment.cancellationReason)</label>
          <select id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required>
            {MOTIVOS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-cancelar-submit" disabled={submitting}>
          {submitting ? "Cancelando…" : "Confirmar cancelación"}
        </button>
      </form>
      <p className="back-block"><Link to="/operador/cancelar">← Volver a cancelación</Link></p>
    </>
  );
}
