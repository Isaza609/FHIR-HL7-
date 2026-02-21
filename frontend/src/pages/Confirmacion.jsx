import { Link, useLocation } from "react-router-dom";

export default function Confirmacion() {
  const location = useLocation();
  const state = location.state || {};
  const { slotStart, slotEnd, patientId, tipoConsulta, servicio, appointmentId } = state;

  return (
    <div className="pagina">
      <header className="header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Cita agendada</p>
      </header>
      <main className="main">
        <h2>Cita confirmada</h2>
        <p className="confirmacion-ok">Su cita ha sido agendada correctamente (AppointmentResponse enviado).</p>
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
          <Link to="/mis-citas">Ver mis citas</Link>
          {" · "}
          <Link to="/">Volver al inicio</Link>
        </p>
      </main>
    </div>
  );
}
