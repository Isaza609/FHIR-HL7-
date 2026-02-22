import { Link, useLocation } from "react-router-dom";

export default function OperadorConfirmacion() {
  const location = useLocation();
  const state = location.state || {};
  const { slotStart, slotEnd, patientId, tipoConsulta, servicio, appointmentId } = state;

  return (
    <>
      <h2>Cita registrada</h2>
      <p className="confirmacion-ok">La cita ha sido agendada correctamente (AppointmentResponse).</p>
      <ul className="confirmacion-detalle">
        {slotStart && <li><strong>Hora inicio:</strong> {new Date(slotStart).toLocaleString("es-CO")}</li>}
        {slotEnd && <li><strong>Hora fin:</strong> {new Date(slotEnd).toLocaleString("es-CO")}</li>}
        {servicio && <li><strong>Servicio:</strong> {servicio}</li>}
        {tipoConsulta && <li><strong>Tipo de consulta:</strong> {tipoConsulta}</li>}
        <li><strong>Médico / profesional:</strong> Asignado según agenda</li>
        {patientId && <li><strong>Paciente:</strong> {patientId}</li>}
        {appointmentId && <li><strong>N.º de cita:</strong> {appointmentId}</li>}
      </ul>
      <p>
        <Link to="/operador/disponibilidad">Nueva búsqueda de disponibilidad</Link>
        {" · "}
        <Link to="/operador/cancelar">Ir a cancelación</Link>
        {" · "}
        <Link to="/">Sitio público</Link>
      </p>
    </>
  );
}
