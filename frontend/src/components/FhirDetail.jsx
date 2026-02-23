import { useState } from "react";
import { Icon } from "./Icons";

/**
 * Bloque colapsable con referencias FHIR (Appointment, Slot, PractitionerRole) para contexto técnico/interoperabilidad.
 * defaultOpen: si true, se muestra abierto por defecto (útil para presentaciones).
 */
export default function FhirDetail({ appointmentId, slotId, practitionerRoleRef, patientRef, coverageRef, payorRef, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasAny = appointmentId || slotId || practitionerRoleRef || patientRef || coverageRef || payorRef;
  if (!hasAny) return null;

  return (
    <section className="fhir-detail" aria-labelledby="fhir-detail-heading">
      <button
        type="button"
        className="fhir-detail-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="fhir-detail-content"
        id="fhir-detail-heading"
      >
        <Icon name="fhir" aria-hidden />
        <span>Detalle técnico (FHIR R4)</span>
      </button>
      <div id="fhir-detail-content" className="fhir-detail-content" hidden={!open}>
        <ul className="fhir-detail-list">
          {appointmentId && (
            <li><strong>Appointment:</strong> <code>{appointmentId}</code></li>
          )}
          {slotId && (
            <li><strong>Slot:</strong> <code>{slotId}</code></li>
          )}
          {practitionerRoleRef && (
            <li><strong>PractitionerRole:</strong> <code>{practitionerRoleRef}</code></li>
          )}
          {patientRef && (
            <li><strong>Patient:</strong> <code>{patientRef}</code></li>
          )}
          {coverageRef && (
            <li><strong>Coverage:</strong> <code>{coverageRef}</code></li>
          )}
          {payorRef && (
            <li><strong>Organization (aseguradora):</strong> <code>{payorRef}</code></li>
          )}
        </ul>
      </div>
    </section>
  );
}
