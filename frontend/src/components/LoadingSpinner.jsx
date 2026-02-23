/**
 * Spinner de carga accesible (aria-busy / aria-live en el contenedor que lo use).
 */
export default function LoadingSpinner({ "aria-label": ariaLabel = "Cargando" }) {
  return (
    <span
      className="loading-spinner"
      role="status"
      aria-label={ariaLabel}
    />
  );
}
