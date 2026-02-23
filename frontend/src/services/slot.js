import { fhirGet } from "./fhir";

/**
 * IDs de Schedule de ACME (para filtrar en servidor público).
 * Coinciden con config/filtros-servidor-publico.json del proyecto.
 */
export const DEFAULT_SCHEDULE_IDS = [
  "sched-hs-pediatria-2025-02",
  "sched-pr-casas-2025-02",
];

/**
 * Obtiene Slot con status=free para uno o varios Schedule.
 * GET Slot?status=free&schedule=Schedule/{id1}&schedule=Schedule/{id2}
 * @param {string[]} [scheduleIds] - IDs de Schedule (sin prefijo "Schedule/"). Por defecto DEFAULT_SCHEDULE_IDS.
 * @returns {Promise<object>} Bundle con entry[].resource = Slot
 */
export async function getSlotsFree(scheduleIds = DEFAULT_SCHEDULE_IDS) {
  const params = new URLSearchParams();
  params.set("status", "free");
  // HAPI espera el id del Schedule sin prefijo "Schedule/" en la búsqueda
  scheduleIds.forEach((id) => {
    params.append("schedule", id);
  });
  const path = `Slot?${params.toString()}`;
  return fhirGet(path);
}

/**
 * Slot libres para un único Schedule.
 * @param {string} scheduleId - Id del Schedule (ej. "sched-pr-casas-2025-02")
 * @returns {Promise<object>} Bundle con entry[].resource = Slot
 */
export async function getSlotsFreeBySchedule(scheduleId) {
  return getSlotsFree([scheduleId]);
}

/**
 * Obtiene los Schedule asociados a un HealthcareService (actor).
 * GET Schedule?actor=HealthcareService/{id}
 * @param {string} healthcareServiceId - Id del HealthcareService
 * @returns {Promise<string[]>} Array de ids de Schedule
 */
export async function getScheduleIdsByHealthcareService(healthcareServiceId) {
  const ref = `HealthcareService/${healthcareServiceId}`;
  const bundle = await fhirGet(`Schedule?actor=${encodeURIComponent(ref)}`);
  const list = bundle.entry?.map((e) => e.resource?.id).filter(Boolean) || [];
  return list;
}
