import { fhirGet } from "./fhir";

/**
 * Obtiene la cobertura (Coverage) y aseguradora (Organization) de un paciente.
 * @param {string} patientId - Id del Patient
 * @returns {Promise<{ coverageId: string | null, payorRef: string | null, aseguradoraName: string }>}
 */
export async function getCoverageForPatient(patientId) {
  if (!patientId) return { coverageId: null, payorRef: null, aseguradoraName: "" };
  try {
    const ref = `Patient/${patientId}`;
    const bundle = await fhirGet(`Coverage?beneficiary=${encodeURIComponent(ref)}&status=active`);
    const coverage = bundle.entry?.[0]?.resource;
    if (!coverage) return { coverageId: null, payorRef: null, aseguradoraName: "" };
    const payorRef = coverage.payor?.[0]?.reference || null;
    if (!payorRef || !payorRef.startsWith("Organization/")) {
      return { coverageId: coverage.id, payorRef, aseguradoraName: "" };
    }
    const orgId = payorRef.replace("Organization/", "");
    const org = await fhirGet(`Organization/${orgId}`);
    const aseguradoraName = org?.name || payorRef;
    return { coverageId: coverage.id, payorRef, aseguradoraName };
  } catch {
    return { coverageId: null, payorRef: null, aseguradoraName: "" };
  }
}
