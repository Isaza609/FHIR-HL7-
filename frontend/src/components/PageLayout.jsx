import { Link } from "react-router-dom";

/**
 * Layout estándar de página: cabecera institucional + main con role="main".
 * Opcional: enlace "Volver", enlace "Acceso operador".
 */
export default function PageLayout({
  tagline,
  backTo,
  backLabel = "Volver",
  showOperadorLink = false,
  children,
  className = "",
}) {
  return (
    <div className={`pagina ${className}`.trim()}>
      <header className="header">
        <Link to="/" className="logo">
          ACME Salud
        </Link>
        {tagline && <p className="tagline">{tagline}</p>}
        {showOperadorLink && (
          <Link to="/operador" className="operador-link">
            Acceso operador (Call Center)
          </Link>
        )}
      </header>
      <main className="main" role="main" id="main-content">
        {backTo != null && backTo !== "" && (
          <Link to={backTo} className="back" aria-label={backLabel}>
            ← {backLabel}
          </Link>
        )}
        {children}
      </main>
    </div>
  );
}
