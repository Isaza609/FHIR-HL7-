import { FHIR_BASE_URL } from "../config";

const headers = {
  "Content-Type": "application/fhir+json",
  Accept: "application/fhir+json",
};

/**
 * GET a un recurso o búsqueda FHIR.
 * @param {string} path - Ruta relativa (ej. "Slot", "Slot?status=free&schedule=Schedule/sched-pr-casas-2025-02")
 * @returns {Promise<object>} Respuesta JSON (Bundle o Resource)
 */
export async function fhirGet(path) {
  const url = path.startsWith("http") ? path : `${FHIR_BASE_URL}/${path}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: headers.Accept } });
  if (!res.ok) throw new Error(`FHIR GET ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * PUT para crear/actualizar un recurso por id.
 * @param {string} resourceType - Ej. "Appointment", "Slot"
 * @param {string} id - Id del recurso
 * @param {object} body - Cuerpo JSON del recurso FHIR
 * @returns {Promise<object>} Recurso devuelto por el servidor
 */
export async function fhirPut(resourceType, id, body) {
  const url = `${FHIR_BASE_URL}/${resourceType}/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`FHIR PUT ${resourceType}/${id}: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * POST para crear un recurso (sin id en URL) o operaciones.
 * @param {string} path - Ruta (ej. "Appointment")
 * @param {object} body - Cuerpo JSON
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function fhirPost(path, body) {
  const url = path.startsWith("http") ? path : `${FHIR_BASE_URL}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`FHIR POST ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

export { FHIR_BASE_URL };
