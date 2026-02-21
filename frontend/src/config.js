/**
 * Configuración del frontend ACME Salud.
 * En desarrollo usamos el proxy de Vite (/api/fhir) para evitar CORS.
 * En producción o si defines VITE_FHIR_BASE_URL, se usa esa URL.
 */
export const FHIR_BASE_URL =
  import.meta.env.VITE_FHIR_BASE_URL ||
  (import.meta.env.DEV ? `${window.location.origin}/api/fhir` : "http://hapi.fhir.org/baseR4");
