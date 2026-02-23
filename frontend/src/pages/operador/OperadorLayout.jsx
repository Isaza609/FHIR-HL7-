import { Outlet, NavLink, Link, useMatch } from "react-router-dom";

export default function OperadorLayout() {
  const matchDisponibilidad = useMatch("/operador/disponibilidad");
  const matchAgendar = useMatch("/operador/agendar/*");
  const matchCancelar = useMatch("/operador/cancelar/*");

  return (
    <div className="pagina operador">
      <header className="header operador-header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Call Center – Agenda interoperable</p>
        <nav className="operador-tabs" aria-label="Navegación operador">
          <NavLink to="/operador/disponibilidad" end className={({ isActive }) => (isActive ? "tab active" : "tab")} aria-current={matchDisponibilidad ? "page" : undefined}>
            Disponibilidad
          </NavLink>
          <NavLink to="/operador/agendar" end={false} className={({ isActive }) => (isActive ? "tab active" : "tab")} aria-current={matchAgendar ? "page" : undefined}>
            Registrar cita
          </NavLink>
          <NavLink to="/operador/cancelar" end={false} className={({ isActive }) => (isActive ? "tab active" : "tab")} aria-current={matchCancelar ? "page" : undefined}>
            Cancelar cita
          </NavLink>
        </nav>
      </header>
      <main className="main" role="main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
