import { fhirGet } from "./fhir";

/** IDs de Location (sedes) ACME – coinciden con config/filtros-servidor-publico.json */
export const LOCATION_IDS = ["loc-norte", "loc-centro", "loc-sur"];

/**
 * Lista de Location (sedes) desde el servidor FHIR.
 * @returns {Promise<object[]>} Array de recursos Location
 */
export async function getLocations() {
  const idParam = LOCATION_IDS.join(",");
  const bundle = await fhirGet(`Location?_id=${idParam}`);
  return bundle.entry?.map((e) => e.resource) || [];
}

/**
 * HealthcareService por Location (sede).
 * @param {string} locationId - Id de Location
 * @returns {Promise<object[]>} Array de recursos HealthcareService
 */
export async function getHealthcareServicesByLocation(locationId) {
  const ref = `Location/${locationId}`;
  const bundle = await fhirGet(`HealthcareService?location=${encodeURIComponent(ref)}`);
  return bundle.entry?.map((e) => e.resource) || [];
}
