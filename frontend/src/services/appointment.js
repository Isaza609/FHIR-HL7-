import { fhirGet, fhirPut } from "./fhir";

/**
 * Obtiene un Slot por id.
 * @param {string} slotId
 * @returns {Promise<object>} Recurso Slot
 */
export async function getSlot(slotId) {
  return fhirGet(`Slot/${slotId}`);
}

/**
 * Obtiene un Schedule por id (para leer actor = PractitionerRole o HealthcareService).
 * @param {string} scheduleId - Id sin prefijo (ej. "sched-pr-casas-2025-02")
 * @returns {Promise<object>} Recurso Schedule
 */
export async function getSchedule(scheduleId) {
  return fhirGet(`Schedule/${scheduleId}`);
}

/**
 * Obtiene un PractitionerRole para usar en el Appointment (p. ej. desde Schedule.actor).
 * Si el Schedule tiene actor HealthcareService, se puede usar PractitionerRole?healthcareService=...
 * @param {string} practitionerRoleRef - Referencia "PractitionerRole/id"
 * @returns {Promise<object>} Recurso PractitionerRole
 */
export async function getPractitionerRole(practitionerRoleRef) {
  const id = practitionerRoleRef?.replace("PractitionerRole/", "") || practitionerRoleRef;
  return fhirGet(`PractitionerRole/${id}`);
}

/**
 * Crea un Appointment (PUT con id generado) y actualiza el Slot a busy.
 * @param {object} params
 * @param {string} params.slotId - Id del Slot
 * @param {object} params.slotResource - Recurso Slot completo (para el PUT a busy)
 * @param {string} params.patientId - Id del Patient (ej. "pat-ejemplo-001")
 * @param {string} params.practitionerRoleRef - Referencia "PractitionerRole/id"
 * @param {string} params.start - ISO datetime inicio
 * @param {string} params.end - ISO datetime fin
 * @param {string} params.serviceTypeCode - Código tipo servicio (ej. "57")
 * @param {string} params.serviceTypeDisplay - Display (ej. "Control - Pediatría")
 * @returns {Promise<{ appointment: object }>} Appointment creado
 */
export async function createAppointmentAndReserveSlot({
  slotId,
  slotResource,
  patientId,
  practitionerRoleRef,
  start,
  end,
  serviceTypeCode = "57",
  serviceTypeDisplay = "Consulta",
}) {
  const appointmentId = `appt-${Date.now()}`;
  const appointment = {
    resourceType: "Appointment",
    id: appointmentId,
    status: "booked",
    start,
    end,
    slot: [{ reference: `Slot/${slotId}` }],
    serviceType: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/service-type", code: serviceTypeCode, display: serviceTypeDisplay }] }],
    participant: [
      { actor: { reference: `Patient/${patientId}` }, required: "required", status: "accepted" },
      { actor: { reference: practitionerRoleRef }, required: "required", status: "accepted" },
    ],
  };
  await fhirPut("Appointment", appointmentId, appointment);

  const slotBusy = { ...slotResource, status: "busy" };
  await fhirPut("Slot", slotId, slotBusy);

  const apptRespId = `apptresp-${Date.now()}`;
  await fhirPut("AppointmentResponse", apptRespId, {
    resourceType: "AppointmentResponse",
    id: apptRespId,
    appointment: { reference: `Appointment/${appointmentId}` },
    actor: { reference: `Patient/${patientId}` },
    participantStatus: "accepted",
  });

  return { appointment: { ...appointment, id: appointmentId }, appointmentId };
}

/**
 * Obtiene el PractitionerRole a usar para un Appointment a partir del Schedule del Slot.
 * Si Schedule.actor es PractitionerRole, lo devuelve; si es HealthcareService, busca un PractitionerRole con ese servicio.
 */
export async function getPractitionerRoleForSlot(slotResource) {
  const scheduleRef = slotResource?.schedule?.reference;
  if (!scheduleRef) throw new Error("Slot sin referencia a Schedule");
  const scheduleId = scheduleRef.replace("Schedule/", "");
  const schedule = await getSchedule(scheduleId);
  const actor = schedule?.actor?.[0]?.reference;
  if (!actor) throw new Error("Schedule sin actor");
  if (actor.startsWith("PractitionerRole/")) return actor;
  if (actor.startsWith("HealthcareService/")) {
    const bundle = await fhirGet(`PractitionerRole?healthcareService=${encodeURIComponent(actor)}`);
    const first = bundle.entry?.[0]?.resource;
    if (!first) throw new Error("No hay PractitionerRole para este servicio");
    return `PractitionerRole/${first.id}`;
  }
  throw new Error("Actor no soportado");
}

/**
 * Obtiene un Appointment por id.
 * @param {string} appointmentId
 * @returns {Promise<object>} Recurso Appointment
 */
export async function getAppointment(appointmentId) {
  return fhirGet(`Appointment/${appointmentId}`);
}

/**
 * Cancela un Appointment y libera el Slot (status free).
 * @param {string} appointmentId - Id del Appointment
 * @param {string} cancelationReasonCode - Código motivo (ej. "pat", "prov")
 * @param {string} [cancelationReasonDisplay] - Display del motivo
 * @returns {Promise<void>}
 */
export async function cancelAppointment(appointmentId, cancelationReasonCode = "pat", cancelationReasonDisplay = "Patient") {
  const appointment = await getAppointment(appointmentId);
  if (appointment.status === "cancelled") return;
  const slotRef = appointment.slot?.[0]?.reference;
  if (!slotRef) throw new Error("Appointment sin referencia a Slot");
  const slotId = slotRef.replace("Slot/", "");
  const slot = await getSlot(slotId);

  const updatedAppointment = {
    ...appointment,
    status: "cancelled",
    cancelationReason: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/appointment-cancellation-reason", code: cancelationReasonCode, display: cancelationReasonDisplay }],
    },
  };
  await fhirPut("Appointment", appointmentId, updatedAppointment);

  const slotFree = { ...slot, status: "free" };
  await fhirPut("Slot", slotId, slotFree);
}
