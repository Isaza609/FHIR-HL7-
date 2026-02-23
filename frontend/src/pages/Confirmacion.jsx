import { Link, useLocation } from "react-router-dom";
import { USE_MOCK_DATA } from "../config";
import PageLayout from "../components/PageLayout";
import FhirDetail from "../components/FhirDetail";
import ReqNote from "../components/ReqNote";
import { Icon } from "../components/Icons";

const MOCK_STATE = {
  slotStart: new Date(Date.now() + 86400000).toISOString().replace("Z", ""),
  slotEnd: new Date(Date.now() + 86400000 + 30 * 60000).toISOString().replace("Z", ""),
  patientId: "patient-1",
  tipoConsulta: "Primera vez – Medicina general",
  servicio: "Primera vez Medicina general",
  appointmentId: "appt-mock-123",
  practitionerName: "Diego Narváez",
  practitionerRoleRef: "PractitionerRole/pr-narvaez-oncologia-sur",
  slotId: "slot-mock-1-0",
  patientRef: "Patient/patient-1",
  comentarios: "Cita programada según disponibilidad de la agenda.",
  aseguradoraName: "Salud Completa",
  coverageRef: "Coverage/cov-001",
  payorRef: "Organization/org-aseguradora-salud-completa",
};

export default function Confirmacion() {
  const location = useLocation();
  const state = location.state || (USE_MOCK_DATA ? MOCK_STATE : {});
  const { slotStart, slotEnd, patientId, tipoConsulta, servicio, appointmentId, practitionerName, slotId, practitionerRoleRef, patientRef, comentarios, aseguradoraName, coverageRef, payorRef } = state;

  return (
    <PageLayout tagline="Cita agendada">
      <h2><Icon name="check" /> Cita confirmada</h2>
      <ReqNote num={6}>Al agendar la cita, el paciente recibe un AppointmentResponse que informa: hora de inicio y fin, servicio de salud, médico tratante y comentarios relevantes.</ReqNote>
      <p className="confirmacion-ok">Su cita ha sido agendada correctamente (AppointmentResponse enviado).</p>
      <section className="req-section" aria-labelledby="appt-response-heading">
        <h3 id="appt-response-heading">Contenido del AppointmentResponse (Req. 6)</h3>
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
        <Link to="/mis-citas">Ver mis citas</Link>
        <Link to="/">Volver al inicio</Link>
      </div>
    </PageLayout>
  );
}
