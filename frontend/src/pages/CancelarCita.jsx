import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { cancelAppointment } from "../services/appointment";
import { USE_MOCK_DATA } from "../config";
import PageLayout from "../components/PageLayout";
import ReqNote from "../components/ReqNote";
import { Icon } from "../components/Icons";

const MOTIVOS = [
  { value: "pat", label: "Paciente (solicitud del paciente)" },
  { value: "prov", label: "Prestador (por el médico o institución)" },
  { value: "pat-crs", label: "Paciente – Enfermedad" },
  { value: "pat-mt", label: "Paciente – Mudanza" },
];

export default function CancelarCita() {
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
        navigate("/mis-citas", { state: { cancelled: appointmentId, cancellationReason: m.value, cancellationReasonDisplay: m.label } });
        setSubmitting(false);
        return;
      }
      const m = MOTIVOS.find((x) => x.value === motivo) || MOTIVOS[0];
      await cancelAppointment(appointmentId, m.value, m.label);
      navigate("/mis-citas", { state: { cancelled: appointmentId } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointmentId) {
    return (
      <PageLayout tagline="Cancelar cita" backTo="/mis-citas" backLabel="Volver a mis citas">
        <p>No se ha seleccionado una cita. <Link to="/mis-citas">Ver mis citas</Link>.</p>
      </PageLayout>
    );
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleString("es-CO") : "");

  return (
    <PageLayout tagline="Cancelar cita" backTo="/mis-citas" backLabel="Volver a mis citas">
      <h2><Icon name="cancel" /> Cancelar cita</h2>
      <ReqNote num={7}>Si el paciente cancela: debe cambiar el estado (Appointment.status) y registrarse el motivo (Appointment.cancellationReason).</ReqNote>
      <p className="info">Cita (Appointment): {appointmentId} · {formatDate(appointment?.start)} – {formatDate(appointment?.end)}</p>
        <form onSubmit={handleSubmit} className="form-cita">
          <div className="form-group">
            <label htmlFor="motivo">Motivo de cancelación (Appointment.cancellationReason)</label>
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
    </PageLayout>
  );
}
