import { Link, useLocation } from "react-router-dom";
import FhirDetail from "../../components/FhirDetail";
import ReqNote from "../../components/ReqNote";
import { Icon } from "../../components/Icons";

export default function OperadorConfirmacion() {
  const location = useLocation();
  const state = location.state || {};
  const { slotStart, slotEnd, patientId, tipoConsulta, servicio, appointmentId, practitionerName, slotId, practitionerRoleRef, patientRef, comentarios, aseguradoraName, coverageRef, payorRef } = state;

  return (
    <>
      <h2><Icon name="check" /> Cita registrada</h2>
      <ReqNote num={6}>Al agendar, el paciente recibe un AppointmentResponse con: hora inicio/fin, servicio de salud, médico tratante y comentarios.</ReqNote>
      <p className="confirmacion-ok">La cita ha sido agendada correctamente (AppointmentResponse).</p>
      <section className="req-section" aria-labelledby="appt-response-heading-op">
        <h3 id="appt-response-heading-op">Contenido del AppointmentResponse (Req. 6)</h3>
        <ul className="confirmacion-detalle">
          {slotStart && <li><strong>Hora de inicio:</strong> {new Date(slotStart).toLocaleString("es-CO")}</li>}
          {slotEnd && <li><strong>Hora de fin:</strong> {new Date(slotEnd).toLocaleString("es-CO")}</li>}
          {servicio && <li><strong>Servicio de salud:</strong> {servicio}</li>}
          {tipoConsulta && <li><strong>Tipo de consulta:</strong> {tipoConsulta}</li>}
          <li>
            <strong>Médico tratante (Practitioner):</strong> {practitionerName || "Asignado según agenda"}
            {practitionerRoleRef && (
              <span className="confirmacion-ref">PractitionerRole: <code>{practitionerRoleRef}</code></span>
            )}
          </li>
          {comentarios && <li><strong>Comentarios relevantes:</strong> {comentarios}</li>}
          {patientId && <li><strong>Paciente (Patient):</strong> {patientId}</li>}
          {(aseguradoraName || coverageRef) && (
            <li><strong>Cobertura (Coverage) – Aseguradora (Organization):</strong> {aseguradoraName || ""} {coverageRef && <span className="confirmacion-ref">{coverageRef} {payorRef && <> · {payorRef}</>}</span>}</li>
          )}
          {appointmentId && <li><strong>N.º de cita (Appointment):</strong> {appointmentId}</li>}
        </ul>
      </section>
      <FhirDetail appointmentId={appointmentId} slotId={slotId} practitionerRoleRef={practitionerRoleRef} patientRef={patientRef} coverageRef={coverageRef} payorRef={payorRef} defaultOpen={!!(appointmentId || practitionerRoleRef)} />
      <div className="link-group">
        <Link to="/operador/disponibilidad">Nueva búsqueda de disponibilidad</Link>
        <Link to="/operador/cancelar">Ir a cancelación</Link>
        <Link to="/">Sitio público</Link>
      </div>
    </>
  );
}
